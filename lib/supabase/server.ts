import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  const store = await cookies();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://rggehomgiolkfdvmqhih.supabase.co";
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_GlzQFoD6bcaeaxTiAGn0Xg_W8CXA1T_";
  return createServerClient(url,key,{cookies:{getAll:()=>store.getAll(),setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options));}catch{}}}});
}
