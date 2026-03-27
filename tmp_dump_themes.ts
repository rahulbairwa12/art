
import * as kv from './src/lib/kv';

async function dumpThemes() {
  try {
    const themes = await kv.getByPrefix('theme:');
    console.log(JSON.stringify(themes, null, 2));
  } catch (error) {
    console.error(error);
  }
}

dumpThemes();
