async function reproducirVoz(textoIngresado) {
    const speaker = 18;

    const queryResponse = await fetch(`http://localhost:50021/audio_query?text=${encodeURIComponent(textoIngresado)}&speaker=${speaker}`, {
        method: 'POST'
    });

    const audioQuery = await queryResponse.json();
    audioQuery.speedScale = 1.5; 
    
    const synthesisResponse = await fetch(`http://localhost:50021/synthesis?speaker=${speaker}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(audioQuery)
    });

    const audioBlob = await synthesisResponse.blob();
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);

    return new Promise((resolve) => {
        audio.onplay = resolve; 
        audio.play();
    });
}

export { reproducirVoz };