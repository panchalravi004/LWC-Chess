
function getPawnPosition(element,dataSet) { 
    var availableSteps = [];
    var availableAttacks = [];

    var val = element.color == 'white' ? 1 : -1;

    if (element.y > 0 && element.y < 7) {
        //find the available steps
        if(element.initial == element.current){
            availableSteps.push([element.y+(1 * val),element.x]);
            if(element.y+(2 * val) >= 2 && element.y+(2 * val) <= 5){
                if(dataSet[element.y+(1 * val)][element.x].current == null){

                    availableSteps.push([element.y+(2 * val),element.x]);
                }
            }
        }else{
            
            availableSteps.push([element.y+(1 * val),element.x]);
        }
        // console.log(JSON.stringify(availableSteps));
        
        //find the available attacks
        if(element.x < 7){
            availableAttacks.push([element.y+(1 * val),element.x + 1]);
        }
        if(element.x > 0){

            availableAttacks.push([element.y+(1 * val),element.x - 1]);
        }
        // console.log(JSON.stringify(availableAttacks));
    }else{
        //pawn replacement goes here----
        console.log('Pawn Replacement');
    }

    return {'steps':availableSteps,'attacks':availableAttacks};
}

function getRookPosition(element,dataSet) {
    var availableSteps = [];
    var availableAttacks = [];

    //find available steps
    // Y Axis : Top
    for (let i = element.y-1; i >= 0; i--) {
        if(dataSet[i][element.x].current != null){
            //add this in attack
            availableAttacks.push([i,element.x]);
            break;
        }else{
            availableSteps.push([i,element.x]);
        }
    }
    // Y Axis : Bottom
    for (let i = element.y+1; i <= 7; i++) {
        if(dataSet[i][element.x].current != null){
            //add this in attack
            availableAttacks.push([i,element.x]);
            break;
        }else{
            availableSteps.push([i,element.x]);
        }
    }
    // X Axis : Left
    for (let i = element.x-1; i >= 0; i--) {
        if(dataSet[element.y][i].current != null){
            //add this in attack
            availableAttacks.push([element.y,i]);
            break;
        }else{
            availableSteps.push([element.y,i]);
        }
    }
    // X Axis : Right
    for (let i = element.x+1; i <= 7; i++) {
        if(dataSet[element.y][i].current != null){
            //add this in attack
            availableAttacks.push([element.y,i]);
            break;
        }else{
            availableSteps.push([element.y,i]);
        }
    }

    // console.log(JSON.stringify(availableSteps));
    return {'steps':availableSteps,'attacks':availableAttacks};
}

function getBishopPosition(element,dataSet) { 
    var availableSteps = [];
    var availableAttacks = [];

    var left = false;
    var right = false;
    var count = 1;
    for (let i = element.y-1; i >= 0; i--) {
        
        if(!left){
            if((element.x - count) >= 0 ){
                if (dataSet[i][element.x - count].current == null) {
                    
                    availableSteps.push([i,element.x - count]);
                }else{
                    availableAttacks.push([i,element.x - count]);
                    left = true;
                }
            }
        }
        if(!right){
            if((element.x + count) <= 7 ){
                if (dataSet[i][element.x + count].current == null) {
                    
                    availableSteps.push([i,element.x + count]);
                }else{
                    availableAttacks.push([i,element.x + count]);
                    right = true;
                }
            }
        }
        count++;
        
    }

    left = false;
    right = false;
    count = 1;
    for (let i = element.y+1; i <= 7; i++) {
        
        if(!left){
            if((element.x - count) >= 0 ){
                if (dataSet[i][element.x - count].current == null) {
                    
                    availableSteps.push([i,element.x - count]);
                }else{
                    availableAttacks.push([i,element.x - count]);
                    left = true;
                }
            }
        }
        if(!right){
            if((element.x + count) <= 7 ){
                if (dataSet[i][element.x + count].current == null) {
                    
                    availableSteps.push([i,element.x + count]);
                }else{
                    availableAttacks.push([i,element.x + count]);
                    right = true;
                }
            }
        }
        count++;
        
    }
    // console.log(JSON.stringify(availableSteps));
    return {'steps':availableSteps,'attacks':availableAttacks};
}

function getKnightPosition(element,dataSet) {
    var availableSteps = [];
    var availableAttacks = [];

    if(element.y >= 2){
        if(element.x > 0){
            if(dataSet[element.y - 2][element.x -1].current == null){
                
                availableSteps.push([element.y - 2,element.x - 1]);
            }else{
                availableAttacks.push([element.y - 2,element.x - 1]);
            }
        }
        if(element.x < 7){
            if(dataSet[element.y - 2][element.x + 1].current == null){

                availableSteps.push([element.y - 2,element.x + 1]);
            }else{
                availableAttacks.push([element.y - 2,element.x + 1]);

            }
        }
    }
    if(element.y <= 5){
        if(element.x > 0){
            if(dataSet[element.y + 2][element.x -1].current == null){

                availableSteps.push([element.y + 2,element.x - 1]);
            }else{
                availableAttacks.push([element.y + 2,element.x - 1]);

            }
        }
        if(element.x < 7){
            if(dataSet[element.y + 2][element.x +1].current == null){

                availableSteps.push([element.y + 2,element.x + 1]);
            }else{
                availableAttacks.push([element.y + 2,element.x + 1]);

            }
        }
    }
    if(element.x >= 2){
        if(element.y > 0){
            if(dataSet[element.y - 1][element.x -2].current == null){

                availableSteps.push([element.y - 1,element.x - 2]);
            }else{
                availableAttacks.push([element.y - 1,element.x - 2]);

            }
        }
        if(element.y < 7){
            if(dataSet[element.y + 1][element.x - 2].current == null){

                availableSteps.push([element.y + 1,element.x - 2]);
            }else{
                availableAttacks.push([element.y + 1,element.x - 2]);

            }
        }
    }
    if(element.x <= 5){
        if(element.y > 0){
            if(dataSet[element.y - 1][element.x + 2].current == null){

                availableSteps.push([element.y - 1,element.x + 2]);
            }else{
                availableAttacks.push([element.y - 1,element.x + 2]);

            }
        }
        if(element.y < 7){
            if(dataSet[element.y + 1][element.x + 2].current == null){

                availableSteps.push([element.y + 1,element.x + 2]);
            }else{
                availableAttacks.push([element.y + 1,element.x + 2]);

            }
        }
    }

    // console.log(JSON.stringify(availableSteps));
    return {'steps':availableSteps,'attacks':availableAttacks};
}

function getQueenPosition(element,dataSet) {
    var availableSteps = [];
    var availableAttacks = [];

    //find available steps
    // Y Axis : Top
    for (let i = element.y-1; i >= 0; i--) {
        if(dataSet[i][element.x].current != null){
            //add this in attack
            availableAttacks.push([i,element.x]);
            break;
        }else{
            availableSteps.push([i,element.x]);
        }
    }
    // Y Axis : Bottom
    for (let i = element.y+1; i <= 7; i++) {
        if(dataSet[i][element.x].current != null){
            //add this in attack
            availableAttacks.push([i,element.x]);
            break;
        }else{
            availableSteps.push([i,element.x]);
        }
    }
    // X Axis : Left
    for (let i = element.x-1; i >= 0; i--) {
        if(dataSet[element.y][i].current != null){
            //add this in attack
            availableAttacks.push([element.y,i]);
            break;
        }else{
            availableSteps.push([element.y,i]);
        }
    }
    // X Axis : Right
    for (let i = element.x+1; i <= 7; i++) {
        if(dataSet[element.y][i].current != null){
            //add this in attack
            availableAttacks.push([element.y,i]);
            break;
        }else{
            availableSteps.push([element.y,i]);
        }
    }
    var left = false;
    var right = false;
    var count = 1;
    for (let i = element.y-1; i >= 0; i--) {
        
        if(!left){
            if((element.x - count) >= 0 ){
                if (dataSet[i][element.x - count].current == null) {
                    
                    availableSteps.push([i,element.x - count]);
                }else{
                    availableAttacks.push([i,element.x - count]);
                    left = true;
                }
            }
        }
        if(!right){
            if((element.x + count) <= 7 ){
                if (dataSet[i][element.x + count].current == null) {
                    
                    availableSteps.push([i,element.x + count]);
                }else{
                    availableAttacks.push([i,element.x + count]);
                    right = true;
                }
            }
        }
        count++;
        
    }

    left = false;
    right = false;
    count = 1;
    for (let i = element.y+1; i <= 7; i++) {
        
        if(!left){
            if((element.x - count) >= 0 ){
                if (dataSet[i][element.x - count].current == null) {
                    
                    availableSteps.push([i,element.x - count]);
                }else{
                    availableAttacks.push([i,element.x - count]);
                    left = true;
                }
            }
        }
        if(!right){
            if((element.x + count) <= 7 ){
                if (dataSet[i][element.x + count].current == null) {
                    
                    availableSteps.push([i,element.x + count]);
                }else{
                    availableAttacks.push([i,element.x + count]);
                    right = true;
                }
            }
        }
        count++;
        
    }
    // console.log(JSON.stringify(availableSteps));
    return {'steps':availableSteps,'attacks':availableAttacks};
}

function getKingPosition(element,dataSet) {
    var availableSteps = [];
    var availableAttacks = [];

    if (element.y > 0) {
        if(dataSet[element.y - 1][element.x].current == null){

            availableSteps.push([element.y - 1,element.x]);
        }else{
            
            availableAttacks.push([element.y - 1,element.x]);
        }
        if(element.x > 0){
            if (dataSet[element.y - 1][element.x -1].current == null) {
                
                availableSteps.push([element.y - 1,element.x - 1]);
            } else {
                
                availableAttacks.push([element.y - 1,element.x - 1]);
            }
        }
        if(element.x < 7){
            if (dataSet[element.y - 1][element.x + 1].current == null) {
                
                availableSteps.push([element.y - 1,element.x + 1]);
            } else {
                availableAttacks.push([element.y - 1,element.x + 1]);
                
            }
        }
    }
    if (element.y < 7) {
        if (dataSet[element.y + 1][element.x].current == null) {

            availableSteps.push([element.y + 1,element.x]);
        }else{
            availableAttacks.push([element.y + 1,element.x]);

        }
        if(element.x > 0){
            if (dataSet[element.y + 1][element.x - 1].current == null) {

                availableSteps.push([element.y + 1,element.x - 1]);
            }else{
                availableAttacks.push([element.y + 1,element.x - 1]);

            }
        }
        if(element.x < 7){
            if (dataSet[element.y + 1][element.x + 1].current == null) {

                availableSteps.push([element.y + 1,element.x + 1]);
            }else{
                availableAttacks.push([element.y + 1,element.x + 1]);

            }
        }
    }
    if(element.x > 0){
        if (dataSet[element.y][element.x - 1].current == null) {

            availableSteps.push([element.y,element.x - 1]);
        }else{
            availableAttacks.push([element.y,element.x - 1]);

        }
    }
    if(element.x < 7){
        if (dataSet[element.y][element.x + 1].current == null) {

            availableSteps.push([element.y,element.x + 1]);
        }else{
            availableAttacks.push([element.y,element.x + 1]);

        }
    }

    // console.log(JSON.stringify(availableSteps));
    return {'steps':availableSteps,'attacks':availableAttacks};
}

export {
    getPawnPosition,
    getRookPosition,
    getBishopPosition,
    getKnightPosition,
    getQueenPosition,
    getKingPosition
};