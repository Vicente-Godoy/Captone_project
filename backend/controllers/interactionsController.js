const { db } = require('../config/firebase');
const admin = require('firebase-admin');

function sortedPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

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

// POST /api/interactions/like { publicationId }
const likePublication = async (req, res) => {
  try {
    const fromUid = req.user?.uid;
    const { publicationId } = req.body || {};
    if (!fromUid) return res.status(401).json({ error: 'No autorizado' });
    if (!publicationId) return res.status(400).json({ error: 'publicationId es obligatorio' });

    const pubDoc = await db.collection('publications').doc(publicationId).get();
    if (!pubDoc.exists) return res.status(404).json({ error: 'Publicación no encontrada' });

    const pub = pubDoc.data();
    const toUid = pub.authorUid || pub.creatorId;
    if (!toUid) return res.status(400).json({ error: 'Publicación sin autor válido' });
    if (toUid === fromUid) return res.status(400).json({ error: 'No puedes dar like a tu propia publicación' });

    const likeId = `${fromUid}_${toUid}`;
    const likeRef = db.collection('likes').doc(likeId);
    const likeSnap = await likeRef.get();
    if (!likeSnap.exists) {
      await likeRef.set({
        fromUid,
        toUid,
        publicationId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // check reciprocal
    const reciprocalId = `${toUid}_${fromUid}`;
    const reciprocalSnap = await db.collection('likes').doc(reciprocalId).get();
    const matched = reciprocalSnap.exists;

    let matchId = null;
    if (matched) {
      const [u1, u2] = sortedPair(fromUid, toUid);
      matchId = `${u1}_${u2}`;
      const matchRef = db.collection('matches').doc(matchId);
      const matchSnap = await matchRef.get();
      if (!matchSnap.exists) {
        const [userA, userB] = await Promise.all([
          getUserPublicData(u1),
          getUserPublicData(u2),
        ]);
        await matchRef.set({
          users: [u1, u2],
          userA,
          userB,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageAt: null,
        });
        // Opcional: crear conversación con el mismo ID
        await db.collection('conversations').doc(matchId).set({
          participants: [u1, u2],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageAt: null,
        }, { merge: true });
      }
    }

    return res.status(200).json({ liked: true, matched, matchId });
  } catch (err) {
    console.error('Error en likePublication:', err);
    return res.status(500).json({ error: 'No se pudo registrar el like' });
  }
};

// GET /api/interactions/matches
const getMyMatches = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'No autorizado' });

    // Evitar índice compuesto obligatorio: quitamos orderBy del query y ordenamos en memoria
    const q = await db.collection('matches').where('users', 'array-contains', uid).limit(100).get();
    const items = q.docs.map(doc => {
      const d = doc.data();
      // Determinar el otro usuario y armar un resumen útil
      const otherUid = d.users?.find(u => u !== uid);
      let other = null;
      if (d.userA?.uid === otherUid) other = d.userA;
      else if (d.userB?.uid === otherUid) other = d.userB;
      return { id: doc.id, ...d, other };
    }).sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    return res.status(200).json(items);
  } catch (err) {
    console.error('Error en getMyMatches:', err);
    return res.status(500).json({ error: 'No se pudieron obtener los matches' });
  }
};

module.exports = { likePublication, getMyMatches };
