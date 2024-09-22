export const ssr = false;


import type { PageLoad } from './$types';
import { load_AllEvents } from '$houdini'


export const load: PageLoad = async (event) => {
  let res = await event.fetch("/api/db")

  return {
    db_data: await res.json(),
    data: await load_AllEvents(event)
  }
};

