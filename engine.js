
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");


var saved_points;
var points;
var hover;
var can_interact;

function clear_display() {
	can_interact = true;
	set([]);
}

function set(p) {
	points = [...p];
	saved_points = [...p];
	document.getElementById('slider').max = points.length;
	document.getElementById('slider').value = points.length;
}

function remove_obj_from_arr(obj, arr) {
	var index = arr.indexOf(obj);
	if (index > -1) {
		arr.splice(index, 1);
	}
}


function click(x, y) {
	if (can_interact) {
		points.push({x:x, y:y});
		saved_points.push({x:x, y:y});
		document.getElementById('slider').max = points.length;
		document.getElementById('slider').value = points.length;
	}
}


function update() {

	simplify_to(Number(document.getElementById('slider').value));


	ctx.clearRect(0,0,canvas.width, canvas.height);

	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";
	for (var i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI);
		ctx.fill();
		// ctx.font = "40px Arial";
		// ctx.fillText(i, points[i].x, points[i].y);
	}

	// lines
	for (var i = 0; i < points.length - 1; i++) {
		ctx.beginPath();
		ctx.moveTo(points[i].x, points[i].y);
		ctx.lineTo(points[i + 1].x, points[i + 1].y);
		ctx.stroke();
	}


	// hover
	ctx.fillStyle = "red";
	if (hover && can_interact) {
		ctx.beginPath();
		ctx.arc(hover.x, hover.y, 5, 0, 2 * Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(hover.x, hover.y, 15, 0, 2 * Math.PI);
		ctx.stroke();
	}
	if (points.length > 0) {
		ctx.beginPath();
		ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
		if (hover && can_interact) {
			ctx.lineTo(hover.x, hover.y);
		}
		ctx.lineTo(points[0].x, points[0].y);
		ctx.stroke();
	}


}
setInterval(update, 1);

function distance(a, b) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function reduce() {
	if (points.length > 3) {
		var min_prot = Math.PI;
		var point_to_go;
		for (var i = 0; i < points.length; i++) {
			var a = points[(i - 1 + points.length) % points.length];
			var b = points[i];
			var c = points[(i + 1) % points.length];
			var ab = distance(a,b);
			var bc = distance(b,c);
			var ca = distance(c,a);
			var angle = Math.acos((-(ca**2) + bc**2 + ab**2)/(2 * bc * ab));
			var prot = Math.abs(Math.PI - angle);
			if (prot < min_prot) {
				min_prot = prot;
				point_to_go = i;
			}
		}
		remove_obj_from_arr(points[point_to_go], points);
	}
}

function export_points() {
	document.getElementById('export').innerHTML = JSON.stringify(points);
	document.getElementById('export').rows = Math.min(300, points.length);
}

function simplify_to(n) {
	if (n <= saved_points.length) {
		points = [...saved_points];
		for (var i = 0; points.length > n; i++) {
			reduce();
		}
		can_interact = n == saved_points.length;
	}
}

canvas.addEventListener('click', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	click(user_x, user_y);
});

canvas.addEventListener('mousemove', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	hover = {x:user_x, y:user_y};
	if (!can_interact) {
		document.getElementById('alert').innerHTML = "move the slider back to the right before you add more points";
	}
});

canvas.addEventListener('mouseout', function() {
	hover = {};
	document.getElementById('alert').innerHTML = "&emsp;";
});
