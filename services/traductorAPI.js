export async function traducir(texto, origen, destino) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${origen}|${destino}`;
    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      return datos.responseData.translatedText;
    } catch (error) {
      console.error('Error al traducir:', error);
    }

  }
  