import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aygklcvmformzblzomie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Z2tsY3ZtZm9ybXpibHpvbWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzI5MzYsImV4cCI6MjA4ODI0ODkzNn0.a7cpOSxgUwvVKLq7skZNDzX55XkO89H3SCwKvXzgC60';

export const supabase = createClient(supabaseUrl, supabaseKey);
