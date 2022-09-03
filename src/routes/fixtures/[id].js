import { database } from '../../config/firebase.js';
import { ref, child, get as firebaseGet } from 'firebase/database';

/** @type {import('./__types/[id]').RequestHandler} */
export async function get({ params }) {
	let fixture;

	const dbRef = ref(database);
	let snapshot = await firebaseGet(child(dbRef, `fixtures/${params.id}`));

	if (snapshot.exists()) {
		fixture = snapshot.val();
		return {
			status: 200,
			headers: {},
			body: {
				id: params.id,
				fixture,
			},
		};
	}

	return {
		status: 404,
	};
}
