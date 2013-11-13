function rmsDiff(data1,data2){
    var squares = 0;
    for(var i = 0; i<data1.length; i++){
        squares += (data1[i]-data2[i])*(data1[i]-data2[i]);
    }
	var rms = Math.sqrt(squares/data1.length);
    return rms;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function createPoint(can){
	return [Math.floor(Math.random() * can.width), Math.floor(Math.random() * can.height)];
}

function cloneCanvas(oldCanvas) {

    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

function drawPoint(canvas){
	var ctx = canvas.getContext('2d');
	var point = createPoint(canvas);
	ctx.fillRect(point[0], point[1], 1, 1);
}

function drawCircle(canvas){
	var ctx = canvas.getContext('2d');
	var maxRad = Math.max(canvas.width, canvas.height);
	var rad = Math.random() * maxRad;
	var point = createPoint(canvas);
	ctx.globalAlpha = Math.random();
	ctx.beginPath();
	ctx.arc(point[0], point[1], rad, 0, 2*Math.PI);
	ctx.fill();
}

function drawTriangle(canvas){
	var ctx = canvas.getContext('2d');
	ctx.globalAlpha = Math.random();
	ctx.beginPath();
	ctx["moveTo"].apply(ctx, createPoint(canvas));
	ctx["lineTo"].apply(ctx, createPoint(canvas));
	ctx["lineTo"].apply(ctx, createPoint(canvas));	
	ctx.closePath();
	ctx.fill();
}

function drawShape(canvas, shapeFunc){
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = getRandomColor();
	shapeFunc(canvas);
}

function ImageEvolverDescriptor(goal, drawFunc){
	return {
		fitnessEvaluator : function(candidate){
			var candidateData = candidate.getContext('2d').getImageData(0, 0, candidate.width, candidate.height);
			var goalData = goal.getContext('2d').getImageData(0, 0, goal.width, goal.height);
			return rmsDiff(candidateData.data, goalData.data);
		},

		creator : function(opts){
			var canvas = document.createElement('canvas');
			canvas.height = goal.height;
			canvas.width = goal.width;
			drawShape(canvas, drawFunc);
			return canvas;
		},

		pipeline :
				EvolverUtils.wrapMutator(function(candidate){
					var newCandidate = cloneCanvas(candidate);
					drawShape(newCandidate, drawFunc);
					return newCandidate;
				}),
				
		hook : function(evolver){
			var candidate = evolver.bestCandidate;
			$('#gencount').html('Generation: ' + evolver.generationCount + ' fitness: ' + evolver.bestFitness + ' age: ' + evolver.bestAge);
			if(evolver.bestAge == 1){
				$('#candidate').get(0).getContext('2d').putImageData(
					candidate.getContext('2d').getImageData(0, 0, candidate.width, candidate.height), 0,0);
			}
		}
	}
}

