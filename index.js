import { supabase }   from "./supabase-client.js";

async function insert(table, data) {
	const {error} = await supabase.from(table).insert(data);
	if (error) 
		console.error('Error inserting data:', error);
}
await insert('users', { username: "gracehopper" ,password: "password123", email: "grace@example.com" });
