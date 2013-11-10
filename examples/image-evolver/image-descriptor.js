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

function createPoints(can){
	var points = [];
	for(var i = 0; i < 3; i++){
		points.push([Math.floor(Math.random() * can.width), Math.floor(Math.random() * can.height)])
	}
	return points;
}

function createTriangle(can){
	return {
		alpha: Math.random(),
		color: getRandomColor(),
		points: createPoints(can)
	}
}

function drawTriangle(ctx, triangle){
	var points = triangle.points;
	ctx.beginPath();
	ctx.globalAlpha = triangle.alpha;
	ctx.fillStyle = triangle.color;
	ctx.moveTo(points[0][0], points[0][1]);
	ctx.lineTo(points[1][0], points[1][1]);
	ctx.lineTo(points[2][0], points[2][1]);
	ctx.closePath();
	ctx.fill();
}

function createCanvas(goal, triangles){
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.height = goal.height;
	canvas.width = goal.width;
	for(var i = 0; i < triangles.length; i++){
		var triangle = triangles[i];
		drawTriangle(ctx, triangle);
	}
	return canvas;
}

function ImageEvolverDescriptor(goal){
	return {
		fitnessEvaluator : function(candidate){
			var candidateData = candidate.canvas.getContext('2d').getImageData(0, 0, candidate.canvas.width, candidate.canvas.height);
			var goalData = goal.getContext('2d').getImageData(0, 0, goal.width, goal.height);
			return rmsDiff(candidateData.data, goalData.data);
		},

		creator : function(opts){
			var maxStartingTriangles = 10;
			var triangles = [];
			for(var i = 0; i < (Math.random() * maxStartingTriangles) + 1; i++){
				triangles.push(createTriangle(goal));
			}
			return {
				triangles: triangles,
				canvas: createCanvas(goal, triangles)
			};
		},

		pipeline : EvolverUtils.operatorPipeline(
			EvolverUtils.wrapMater(function(parent1, parent2){
				var triangles = [];
				for(var i = 0; i < parent1.triangles; i++){
					if(Math.random() <= 0.5){
						triangles.push(parent1.triangles[i]);
					}
				}
				for(var i = 0; i < parent2.triangles; i++){
					if(Math.random() <= 0.5){
						triangles.push(parent2.triangles[i]);
					}
				}
				return {
					triangles: triangles,
					canvas: createCanvas(goal, triangles)
				}
			}), 
			function(probability){
				return EvolverUtils.wrapMutator(function(candidate){
					if(Math.random() <= probability){
						var triangle = createTriangle(goal);
						candidate.triangles.push(triangle)
						drawTriangle(candidate.canvas.getContext('2d'), triangle);
					}
					return candidate;
				});
			}(0.5)
		),

		hook : function(evolver){
			var candidate = evolver.bestCandidate;
			$('#gencount').html('Generation: ' + evolver.generationCount);
			$('#candidate').get(0).getContext('2d').putImageData(
				candidate.canvas.getContext('2d').getImageData(0, 0, candidate.canvas.width, candidate.canvas.height), 0,0);
		}
	}
}

