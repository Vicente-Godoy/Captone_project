const { db } = require('../config/firebase');
const admin = require('firebase-admin');

async function getUserPublicData(uid) {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) return { uid, nombre: 'Usuario', fotoUrl: null };
  const d = snap.data();
  return {
    uid,
    nombre: d.nombre || d.displayName || (d.email ? d.email.split('@')[0] : 'Usuario'),
    fotoUrl: d.fotoUrl || d.photoURL || null,
  };
}

// POST /api/calendar/events/from-schedule
// Body: { conversationId, proposalMessageId }
// Creates canonical event under matches/{conversationId}/calendarEvents and mirrors under users/{uid}/calendarEvents
const createFromSchedule = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const { conversationId, proposalMessageId } = req.body || {};
    if (!uid) return res.status(401).json({ error: 'No autorizado' });
    if (!conversationId || !proposalMessageId) {
      return res.status(400).json({ error: 'conversationId y proposalMessageId son obligatorios' });
    }

    const convoRef = db.collection('conversations').doc(conversationId);
    const convoSnap = await convoRef.get();
    if (!convoSnap.exists) return res.status(404).json({ error: 'Conversación no encontrada' });
    const participants = convoSnap.get('participants') || [];
    if (!participants.includes(uid)) return res.status(403).json({ error: 'No eres participante de esta conversación' });

    const msgRef = convoRef.collection('messages').doc(proposalMessageId);
    const msgSnap = await msgRef.get();
    if (!msgSnap.exists) return res.status(404).json({ error: 'Mensaje de propuesta no encontrado' });
    const msg = msgSnap.data();
    if (msg.type !== 'schedule') return res.status(400).json({ error: 'El mensaje no es de tipo schedule' });

    // Determine acceptance: either message has status accepted, or there is a schedule_response with accepted
    let accepted = msg.status === 'accepted';
    if (!accepted) {
      const respQ = await convoRef
        .collection('messages')
        .where('type', '==', 'schedule_response')
        .where('refId', '==', proposalMessageId)
        .where('status', '==', 'accepted')
        .limit(1)
        .get();
      accepted = !respQ.empty;
    }
    if (!accepted) return res.status(400).json({ error: 'La propuesta aún no ha sido aceptada' });

    const eventAt = msg.eventAt; // Firestore Timestamp
    if (!eventAt) return res.status(400).json({ error: 'La propuesta no contiene fecha (eventAt)' });

    // Idempotency: check if an event already exists for this proposal
    const existingQ = await db
      .collection('matches')
      .doc(conversationId)
      .collection('calendarEvents')
      .where('proposalMessageId', '==', proposalMessageId)
      .limit(1)
      .get();
    if (!existingQ.empty) {
      const doc = existingQ.docs[0];
      return res.status(200).json({ created: false, id: doc.id, ...doc.data() });
    }

    // Build canonical event
    const userA = await getUserPublicData(participants[0]);
    const userB = participants[1] ? await getUserPublicData(participants[1]) : null;
    const canonicalRef = db.collection('matches').doc(conversationId).collection('calendarEvents').doc();
    const canonical = {
      matchId: conversationId,
      participants,
      userA,
      userB,
      conversationId,
      proposalMessageId,
      startAt: eventAt,
      status: 'accepted',
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await canonicalRef.set(canonical);

    // Create mirrors per user
    const otherByUid = {};
    if (userA?.uid && userB?.uid) {
      otherByUid[userA.uid] = userB;
      otherByUid[userB.uid] = userA;
    }
    await Promise.all(
      participants.map(async (puid) => {
        await db
          .collection('users')
          .doc(puid)
          .collection('calendarEvents')
          .doc(canonicalRef.id)
          .set({
            matchId: conversationId,
            conversationId,
            proposalMessageId,
            startAt: eventAt,
            status: 'accepted',
            canonicalRef: canonicalRef.path,
            other: otherByUid[puid] || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      })
    );

    return res.status(201).json({ created: true, id: canonicalRef.id, ...canonical });
  } catch (err) {
    console.error('Error en createFromSchedule:', err);
    return res.status(500).json({ error: 'No se pudo crear el evento de calendario' });
  }
};

// GET /api/calendar/events  -> returns current user future events (accepted) sorted by startAt
const getMyEvents = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'No autorizado' });
    const now = admin.firestore.Timestamp.now();
    // Evitar requerir índices compuestos: ordenar por fecha y filtrar en memoria
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('calendarEvents')
      .orderBy('startAt', 'asc')
      .limit(500)
      .get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((e) => (e.status || 'accepted') === 'accepted')
      .filter((e) => {
        const ts = e.startAt;
        const sec = ts?.seconds ?? ts?._seconds;
        if (typeof sec === 'number') return sec * 1000 >= Date.now() - 60 * 1000; // 1 min de tolerancia
        return true;
      });
    return res.status(200).json(items);
  } catch (err) {
    console.error('Error en getMyEvents:', err);
    return res.status(500).json({ error: 'No se pudieron obtener los eventos' });
  }
};

// POST /api/calendar/events/:id/cancel -> cancels event if requester is participant
const cancelEvent = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const { id } = req.params || {};
    if (!uid) return res.status(401).json({ error: 'No autorizado' });
    if (!id) return res.status(400).json({ error: 'Id de evento requerido' });

    // Locate mirror for current user to find canonical ref
    const myMirrorRef = db.collection('users').doc(uid).collection('calendarEvents').doc(id);
    const myMirrorSnap = await myMirrorRef.get();
    if (!myMirrorSnap.exists) return res.status(404).json({ error: 'Evento no encontrado para este usuario' });
    const mirror = myMirrorSnap.data();
    const path = mirror.canonicalRef;
    if (!path) return res.status(400).json({ error: 'Evento sin referencia canónica' });

    const canonicalRef = db.doc(path);
    const canonicalSnap = await canonicalRef.get();
    if (!canonicalSnap.exists) return res.status(404).json({ error: 'Evento canónico no existe' });
    const canonical = canonicalSnap.data();
    const participants = canonical.participants || [];
    if (!participants.includes(uid)) return res.status(403).json({ error: 'No autorizado a cancelar este evento' });

    const batch = db.batch();
    batch.update(canonicalRef, {
      status: 'cancelled',
      cancelledBy: uid,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // remove mirrors for all participants
    participants.forEach((p) => {
      const ref = db.collection('users').doc(p).collection('calendarEvents').doc(id);
      batch.delete(ref);
    });
    await batch.commit();

    // Optional: message into conversation
    if (canonical.conversationId) {
      try {
        await db
          .collection('conversations')
          .doc(canonical.conversationId)
          .collection('messages')
          .add({
            fromUid: uid,
            type: 'schedule_response',
            status: 'cancelled',
            refId: mirror.proposalMessageId || canonical.proposalMessageId || null,
            text: 'Reunión cancelada',
            eventAt: canonical.startAt || null,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (e) {
        console.warn('No se pudo registrar mensaje de cancelación:', e);
      }
    }

    return res.status(200).json({ cancelled: true });
  } catch (err) {
    console.error('Error en cancelEvent:', err);
    return res.status(500).json({ error: 'No se pudo cancelar el evento' });
  }
};

module.exports = { createFromSchedule, getMyEvents, cancelEvent };
