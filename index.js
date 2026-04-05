import { supabase }   from "./supabase-client.js";
import pkg from 'js-sha3';
const {sha3_512 } = pkg;

async function insert(table, data) {
	var {error} = await supabase.from(table).insert(data);
	if (error) 
		console.error('Error inserting data:', error);
}
async function insertUser(username, password, email) {
	var saltarray = new Uint8Array(16);
	crypto.getRandomValues(saltarray);
	var salt = "";
	for (var i = 0; i < saltarray.length; i++) {
		salt += saltarray[i].toString(16);
	}
	password += salt;
	password = sha3_512(password);
	await insert('users', { username, password, email, salt});
}
// await insert('users', { username: "gracehopper" ,password: "password123", email: "grace@example.com" });
await insertUser("gracehopper", "password123", "grace@example.com");