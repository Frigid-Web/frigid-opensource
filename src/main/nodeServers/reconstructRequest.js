
function reconstructFile(dataChunks) {
     const convertedChunks = dataChunks.map(chunk => new Uint8Array(chunk));

     const totalLength = convertedChunks.reduce((total, currentChunk) => total + currentChunk.length, 0);
     const resultBuffer = new Uint8Array(totalLength); 
     let offset = 0;
     convertedChunks.forEach(chunk => {
         resultBuffer.set(chunk, offset);
         offset += chunk.length;
     });
 
     return resultBuffer;
}


export function traverseAndReconstruct(structure, path) {
    let keys = path.split('/');
    keys = keys.filter(key => key !== '');
    let name = ''
    console.log(keys)
    while(keys.length > 0) {
        let key = keys.shift();
        if(structure[key]){
            name = key;
            structure = structure[key];
        }
        else{
            return null;
        }
    }
    if(structure.data){
        // console.log(structure.data)
        return  {name: name , mime:structure.type, data: reconstructFile(structure.data) } ;
    }
    else{
        return null;
    }

}