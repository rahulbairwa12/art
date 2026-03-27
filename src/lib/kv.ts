import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const client = () => createClient(supabaseUrl, supabaseServiceRoleKey);

export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0c0022a7").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0c0022a7").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0c0022a7").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0c0022a7").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0c0022a7").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0c0022a7").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0c0022a7").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

export const deleteByPrefix = async (prefix: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0c0022a7").delete().like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
};
