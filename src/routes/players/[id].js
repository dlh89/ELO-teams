import { database } from '../../config/firebase.js';
import { ref, child, get as firebaseGet } from 'firebase/database';

/** @type {import('./__types/[id]').RequestHandler} */
export async function get({ params }) {
	let player;

	const dbRef = ref(database);
	let snapshot = await firebaseGet(child(dbRef, `players/${params.id}`));

	if (snapshot.exists()) {
		player = snapshot.val();
		return {
			status: 200,
			headers: {},
			body: { player },
		};
	}

	return {
		status: 404,
	};
}
