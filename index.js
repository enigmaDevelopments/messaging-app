import { supabase }   from "./supabase-client.js";
console.log("Hello world!");
supabase
  .from('test')
  .insert({ test:  Math.floor(Math.random() * 10)}) );

console.log("Inserted a random number into the test table!");