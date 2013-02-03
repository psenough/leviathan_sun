D = document;
D.title = "Loading...";

// init math hashes
PI = Math.PI;
Ro = Math.round;
Ra = Math.random;
si = Math.sin;
co = Math.cos;
rand = function(n){ return Math.floor(Ra()*n); };

// clear document from the png decompression garbage
b = D.body;
b.style.overflow = "hidden";
b.innerHTML = '';

// attach canvas
c = D.createElement('canvas');
b.appendChild(c);
b.style.margin = '0px';
ctx = c.getContext('2d');
var cw = ctx.width = c.width = window.innerWidth;
var ch = ctx.height = c.height = window.innerHeight;

// attach text overlay
var text = D.createElement("div");
var Te = text.style;
Te.position = "absolute";
Te.textAlign = "center";
Te.fontSize = "40px";
Te.top = ch*.90 + "px";
Te.width = "100%";
//Te.color = "#EEE";
Te.fontFamily = "Helvetica";
b.appendChild(text);

// attach audio element
A = D.createElement('audio');
b.appendChild(A);


//
// seed / md5
//
var prmstr = window.location.search.substr(1);
var prmarr = prmstr.split ("&");
var params = {};
for ( var i = 0; i < prmarr.length; i++) {
    var tmparr = prmarr[i].split("=");
    params[tmparr[0]] = tmparr[1];
}
var seed = params.seed;

//thismd5 = md5(seed?seed:Ra());
var thismd5 = (seed?seed:"");
var TH = 0;
if (!seed) for( ; TH < 32; TH++) thismd5 += rand(16).toString(16);

function get(pos) {
	return parseInt("0x"+thismd5.charAt(pos));
}

// prepare speech synth 0 to F text
var st=[ ['siro'], ['uan'], ['tu'], ['tri'], ['to'], ['tai'], ['siks'], ['sev'], ['ei t'], ['nain'], ['ei'], ['b'], ['si'], ['d'], ['i'], ['ev'] ];


//
// linear interpolation
//

//   mapValue(1,0,2,50,100) = 75;
//   mapValue(14,0,16,1.0,1.5) = ~1.44;
function mapValue(inValue, inMin, inMax, outMin, outMax) {
	return  outMin + (- inValue*outMax - inMin*outMax + inValue*outMin + inMin*outMax) / (inMin - inMax);
}


//
// request animation frame, taken from somewhere on the internet
//
/*
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
            //alert("called");
        };
}());*/

// requestAnimationFrame polyfill by @rma4ok
!function (window) {
var
equestAnimationFrame = 'equestAnimationFrame',
requestAnimationFrame = 'r' + equestAnimationFrame,
 
ancelAnimationFrame = 'ancelAnimationFrame',
cancelAnimationFrame = 'c' + ancelAnimationFrame,
 
expectedTime = 0,
vendors = ['moz', 'ms', 'o', 'webkit'],
vendor;
 
while (!window[requestAnimationFrame] && (vendor = vendors.pop())) {
window[requestAnimationFrame] = window[vendor + 'R' + equestAnimationFrame];
window[cancelAnimationFrame] =
window[vendor + 'C' + ancelAnimationFrame] ||
window[vendor + 'CancelR' + equestAnimationFrame];
}
 
if (!window[requestAnimationFrame]) {
window[requestAnimationFrame] = function (callback) {
var
currentTime = +new Date,
adjustedDelay = 16 - (currentTime - expectedTime),
delay = adjustedDelay > 0 ? adjustedDelay : 0;
 
expectedTime = currentTime + delay;
 
return setTimeout(function () {
callback(expectedTime);
}, delay);
};
 
window[cancelAnimationFrame] = clearTimeout;
}
}(this);


//
// precalc
//

var seconds = 32*2*2;
var hz = 44100;
var sA = [];

b.onload = function() {
	
	ctx.clearRect(0,0,cw,ch);
	ctx.fillStyle = "rgb(0,0,0)";
	//ctx.fillRect(0,0,50,ch);
	
	var t = 0;
	var abort = false;
	var myReq;
	function loading() {
		if (!abort) {
			myReq = requestAnimationFrame(loading);
		} else {
			//console.log("end of the world");
			cancelAnimationFrame(myReq);
			launchDemo();
			return;
		}
		//console.log(t + " " + (hz*seconds) + " " + sA[t-1]);
		for (var j=0; j<hz; j++,t++) {
			if (abort) break;
			if (t >= hz*seconds) {
				abort = true;
				return;
			} else {
				
				var sample = parseInt(si(t*.05+si(t*0.002+si(t*0.01*(get(10)*.5+1))))*128+Math.exp(t*si(t*0.1)-t+si(t&t%254))*t) & 0xff;
				sample *= 256;
				if (sample < 0) sample = 0;
				if (sample > 65535) sample = 65535;
				
				sA.push(sample);
			}
		}
		ctx.fillRect(0,0,parseInt(mapValue(t,0,hz*seconds,0,cw)),ch);
	}	
	myReq = requestAnimationFrame(loading);
	D.title="Precalc";
}

var cancel;
function launchDemo() {
	D.title = "Init SoundBuffer";
	//text.innerHTML = D.title;
	au = new Audio("data:audio/x-wav," + bA(RIFFChunk(1, 16, sA)));
	D.title = "Init CanvasLoop";
	//text.innerHTML = D.title;
	TH=au.volume=0;
	cancel = requestAnimationFrame(loop);
	D.title = "Pressing Play";
	//text.innerHTML = D.title;
	au.play();
	//D.title = thismd5;
	//text.innerHTML = "";
}

function loop() {
	if (TH >= seconds) {
		b.innerHTML = "";
		b.appendChild(text);
		Te.top = ch*.22 + "px";
		Te.color = "#000";
		text.innerHTML = "<div style=\"text-align: center\"><h1>Leviathan Sun</h1><br><br><a href=\"http://tpolm.org/~ps/recyclebinladen/leviathan_sun/index.html?seed="+thismd5+"\">"+thismd5+"</a></div>";
		SA('leviethan son');
		cancelAnimationFrame(cancel);
		//D.title = '';
	} else {
		requestAnimationFrame(loop);
		TH = au.currentTime;
		au.volume = TH / seconds;
		dS();
	}
}


//
// bytecode sound synth, based on player and examples from viznut, bemmu et al
//

// [255, 0] -> "%FF%00"
function bA(values) {
    var out = "";
    for (var i = 0; i < values.length; i++) {
        var hex = values[i].toString(16);
        if (hex.length == 1) hex = "0" + hex;
        out += "%" + hex;
    }
    return out.toUpperCase();
}

// Character to ASCII value, or string to array of ASCII values.
function cA(str) {
    if (str.length == 1) {
        return str.charCodeAt(0);
    } else {
        var out = [];
        for (var i = 0; i < str.length; i++) {
            out.push(cA(str[i]));
        }
        return out;
    }
}

function sb(l) {
    return [l&0xff, (l&0xff00)>>8, (l&0xff0000)>>16, (l&0xff000000)>>24];
}

function FMTSubChunk(channels, bPS) {
    var byteRate = hz * channels * bPS/8;
    var blockAlign = channels * bPS/8;
    return [].concat(
        cA("fmt "),
        sb(16), // Subchunk1Size for PCM
        [1, 0], // PCM is 1, split to 16 bit
        [channels, 0], 
        sb(hz),
        sb(byteRate),
        [blockAlign, 0],
        [bPS, 0]
    );
}

function sATD(sA, bPS) {
    if (bPS === 8) return sA;
    if (bPS !== 16) {
        //alert("Only 8 or 16 bit supported.");
        return;
    }
    
    var da = [];
    for (var i = 0; i < sA.length; i++) {
        da.push(0xff & sA[i]);
        da.push((0xff00 & sA[i])>>8);
    }
    return da;
}

function dataSubChunk(channels, bPS, sA) {
    return [].concat(
        cA("data"),
        sb(sA.length * channels * bPS/8),
        sATD(sA, bPS)
    );
}

function chunkSize(fmt, data) {
    return sb(4 + (8 + fmt.length) + (8 + data.length));
}
    
function RIFFChunk(channels, bPS, sA) {
    var fmt = FMTSubChunk(channels, bPS);
    var data = dataSubChunk(channels, bPS, sA);
    var header = [].concat(cA("RIFF"), chunkSize(fmt, data), cA("WAVE"));
    return [].concat(header, fmt, data);
}


//
// speech synth, based from p01's js1k entry
// http://www.p01.org/releases/JS1K_Speech_Synthesizer/
//
	
function SA(M) {
		for(var S='',h=g=l=k=s=0;s<M.length;s+=1/1024,S+=String.fromCharCode(t>255?255:t<0?0:0|t)) {
if(f=g,g=h,j=k,k=l,t=128,p={o:[52,55,10,10,6],i:[45,96,10,10,3],j:[45,96,10,10,3],u:[45,54,10,10,3],a:[58,70,10,10,15],e:[54,90,10,10,15],E:[60,80,10,10,12],w:[43,54,10,10,1],v:[42,60,20,10,3],T:[42,60,40,1,5],z:[45,68,10,5,3],Z:[44,70,50,1,5],b:[44,44,10,10,2],d:[44,99,10,10,2],m:[44,60,10,10,2],n:[44,99,10,10,2],r:[43,50,30,8,3],l:[48,60,10,10,5],g:[42,50,15,5,1],f:[48,60,10,10,4,1],h:[62,66,30,10,10,1],s:[120,150,80,40,5,1],S:[20,70,99,99,10,1],p:[44,50,5,10,2,1],t:[44,60,10,20,3,1],k:[60,99,10,10,6,1]}[M[0|s]]) {
				// 2 formant filters
				i=1-p[2]/255;
				m=1-p[3]/255;
				h=i*(g*2*si(p[0]/25)-i*f)+(p[5]?Ra():s*16%1)-.5;
				l=m*(k*2*si(p[1]/25)-m*j)+(p[5]?Ra():s*16%1)-.5;
				t+=Math.min(1,4*si(PI*s))*((h+l)*p[4]+(g+k)/2+(f+j)/8);
			}
		}
		// generate and play a WAVE PCM file
		t = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA';
		//new Audio(t+btoa(t+S)).play();
		A.src=t+btoa(t+S);
		A.play();

}


//
// main code, 3rd generation adaptation of js1k framework
//
// has to be minified with UglifyJS or closure compiler
// http://marijnhaverbeke.nl/uglifyjs
// and then converted into PNG autoextractor, based on works of daekan, p01 and gasman
// https://gist.github.com/2560551
//

//var tt = (new Date()).getTime();
var iS = 0;

var num, num2, angle, angle2;
//var num = parseInt( mapValue(get(18),0,16,0,40) + mapValue(get(30),0,16,10,20) - mapValue(get(31),0,16,0,10) );
//var num2 = parseInt( mapValue(get(14),0,16,15,40) + mapValue(get(23),0,16,10,20) - mapValue(get(13),0,16,0,10) );

//var angle = (PI*2)/num;
//var angle2 = (PI*2)/num2;
var size = parseInt( mapValue(get(20),0,16,0,50) + mapValue(get(27),0,16,10,30) - mapValue(get(28),0,16,0,10));
var opening, phase0, phase1, phase2, pointx, pointy, pointx2, pointy2, pointx3, pointy3, v1, v2, v3, v4, v6;
var faderR, faderG, faderB;

var GR = mapValue(get(27),0,16,0,255);
var GG = mapValue(get(28),0,16,0,255);
var GB = mapValue(get(29),0,16,0,255);

var recalcNum = (get(17)>8);
var altBW = (get(9)>8);
var numbers = (get(19)>8);
var strobe = (get(23)>8);
var strobeR = mapValue(get(24),0,16,0.0,0.2);

function dS() {

		//var d = new Date();
		//var TI = d.getTime() - tt;
		//var TH = TI/1000;

		var TI=Ro(TH*1000);
		
		phase1 = TI/10000;
		phase0 = (10000 - phase1);
		phase2 = (TI+1000)/10000;
		
		// increase index every 2 seconds
		if (TH > iS * 2)
		{
			D.title = "Leviathan Sun";//thismd5;
			var index = iS%thismd5.length;
			if (numbers) {
				if (iS < thismd5.length) text.innerHTML += thismd5[index];
				SA(st[get(index)][0]);
			}
			iS++;
			
			v1 = parseInt(mapValue(get(index),0,16,0,225));
			v2 = parseInt(mapValue(get((iS+v1)%thismd5.length),0,16,0,225));
			v3 = parseInt(mapValue(get((index+v2)%thismd5.length),0,16,0,225));
			v4 = mapValue(get((iS+v3)%thismd5.length),0,16,0.075,0.2)*au.volume;
			
			// if it's too dark, lets make it blue'er
			//if (v1+v2+v3 < 150) v3 = 100 + v1;
			
			// alternate with black/white background or have gradual fade to color
			if (altBW) {
				if (v1 > 127) {
					faderR = faderG = faderB = parseInt(255-(v1*.1));
					Te.color = "#000";
				} else {
					faderR = faderG = faderB = parseInt(v1*.1);
					Te.color = "#FFF";
				}
			} else {
				if (TH > seconds*.5) Te.color = "#FFF";
			}
			
			v6 = parseInt(mapValue(get(index),0,16,0,3));
			
			if (recalcNum) {
				num = parseInt( mapValue(get(18),0,16,0,38) + mapValue(get(30),0,16,10,20) - mapValue(get(31),0,16,0,10) );
				num2 = parseInt( mapValue(get(14),0,16,15,38) + mapValue(get(23),0,16,10,20) - mapValue(get(13),0,16,0,10) );
			} else {
				num = parseInt( mapValue(get((iS+v1)%thismd5.length),0,16,10,40));
				if (get(16) > 8) {
					num2 = parseInt( mapValue(get(2),0,16,10,40));
				} else {
					num2 = parseInt( mapValue(get((iS+v3)%thismd5.length),0,16,10,40));
				}
			}
			angle = (PI*2)/num;
			angle2 = (PI*2)/num2;
			
			if (!seed) {
				v1++;v2++;v3++;
				v4*=1.5;
			}
			
			// if its too close to background color lets increase the transparency
			if (Math.sqrt((v1-faderR)*(v1-faderR) + (v2-faderG)*(v2-faderG) + (v3-faderB)*(v3-faderB)) < 80) v4*=1.5; 
 
		}
		
		// clean screen			
		if (!altBW) {
			if (TH < seconds*.5) {
				faderR = parseInt( (255 - 255*(TH/seconds)) + GR*(TH/seconds) );
				faderG = parseInt( (255 - 255*(TH/seconds)) + GG*(TH/seconds) );
				faderB = parseInt( (255 - 255*(TH/seconds)) + GB*(TH/seconds) );
			} else {
				faderR = parseInt( (255 - 255*(TH/seconds)) + (GR - GR*(TH/seconds)) );
				faderG = parseInt( (255 - 255*(TH/seconds)) + (GG - GG*(TH/seconds)) );
				faderB = parseInt( (255 - 255*(TH/seconds)) + (GB - GB*(TH/seconds)) );
			}
		}
		
		if (strobe && Ra()<strobeR) {
			faderR = parseInt((faderR+rand(200))%255);
			faderB = parseInt((faderR+faderB*iS)%255);
			faderG = parseInt((120+faderB)%255);
		}
		
		ctx.fillStyle = "rgba(" + faderR + "," + faderG + "," + faderB + ", 1.0)";
		ctx.fillRect(0,0,cw,ch);
		
		// sound sync bars
		//var indexer = parseInt(TH*hz);
		//var ref = part[3][3];
		//var calc = 0;
		//for (var looper = -500; looper < 0; looper++)
		//	if (indexer+looper > 0) calc+= ref[indexer];
		
		// sound buffer sync looks like crap, better have it a tweaked random
		var calc = rand(100);
		if (calc < 25) {
			ctx.fillStyle = "rgba(10,10,10,0.05)";
			var increase = 5*au.volume;
			for (var extra = 0; extra < calc%5; extra++) {
				ctx.fillRect(0,ch*.5 - (40 + increase + extra*40),cw,5+increase);
				ctx.fillRect(0,ch*.5 + 40 + extra*40,cw,5+increase);
			}
		}
		
		ctx.fillStyle = "rgba(" + v1 + "," + v2 + "," + v3 + "," + 
							(v4 + si(phase1)*0.025) + ")";
		
		for (var i=0; i<num; i++) {
			
			for (opening = 60; opening < 1000; opening = opening*2) {
				
				pointx = cw*.5+si(i*angle+phase1)*opening;
				pointy = ch*.5+co(i*angle+phase1)*opening;

				pointx2 = cw*.5+si(i*angle+phase2)*opening*.75;
				pointy2 = ch*.5+co(i*angle+phase2)*opening*.75;

				pointx3 = cw*.5+si(i*angle+phase1)*opening*.5;
				pointy3 = ch*.5+co(i*angle+phase1)*opening*.5;
				
				ctx.beginPath();
				ctx.moveTo(pointx,pointy);
				ctx.lineTo(pointx2,pointy2);
				ctx.lineTo(pointx3,pointy3);
				ctx.fill();
				ctx.closePath();
			}
			
			for (opening = 90+si(phase1)*50; opening < 1000; opening = opening*2) {
				
				pointx = cw*.5+si(i*angle)*opening;
				pointy = ch*.5+co(i*angle)*opening;

				pointx2 = cw*.5+si(i*angle-0.1)*opening*.75;
				pointy2 = ch*.5+co(i*angle-0.1)*opening*.75;

				pointx3 = cw*.5+si(i*angle)*opening*.5;
				pointy3 = ch*.5+co(i*angle)*opening*.5;
				
				ctx.beginPath();
				ctx.moveTo(pointx,pointy);
				ctx.lineTo(pointx2,pointy2);
				ctx.lineTo(pointx3,pointy3);
				ctx.fill();
				ctx.closePath();
				
				if ((num%2 == 0) && (i%v6 == 0)) {
					//if (v1%2 == 0) ctx.globalCompositeOperation = 'lighter';
					// else ctx.globalCompositeOperation = 'source-out';
					var radius = ( v1 + v3 + v3*si(i+phase1) )*v4;
					if (radius < 5) radius = v3*v4;
					ctx.beginPath();
					ctx.arc( pointx, pointy, radius, 0, PI*2, true);
					ctx.fill();
					ctx.closePath();
					//ctx.globalCompositeOperation = 'source-over';
				}
				
			}

		}
		
		for (var i=0; i<num2; i++) {
		
			opening = mapValue(get(12),0,16,ch*.25,ch*.8);
			
			var pointx = cw*.5+si(i*angle2+phase1)*opening;
			var pointy = ch*.5+co(i*angle2+phase1)*opening;

			var pointx2 = cw*.5+si(i*angle2+phase1)*opening*(.5+si(angle2+phase1*10)*.5)*.5;
			var pointy2 = ch*.5+co(i*angle2+phase1)*opening*(.5+si(angle2+phase1*10)*.5)*.5;

			var pointx3 = cw*.5+si(i*angle2+phase1+num2)*opening*(.5+si(angle2+phase1)*.5)*.5;
			var pointy3 = ch*.5+co(i*angle2+phase1+num2)*opening*(.5+si(angle2+phase1)*.5)*.5;
			
			var pointx4 = cw*.5+si((num2-i)*angle2+phase0)*opening;
			var pointy4 = ch*.5+co((num2-i)*angle2+phase0)*opening;

			var pointx5 = cw*.5+si((num2-i)*angle2+phase0)*opening*(.5+si(angle2+phase1*10)*.5)*.5;
			var pointy5 = ch*.5+co((num2-i)*angle2+phase0)*opening*(.5+si(angle2+phase1*10)*.5)*.5;

			var pointx6 = cw*.5+si((num2-i)*angle2+phase0+num2)*opening*(.5+si(angle2+phase1*11)*.5)*.5;
			var pointy6 = ch*.5+co((num2-i)*angle2+phase0+num2)*opening*(.5+si(angle2+phase1*11)*.5)*.5;

			ctx.beginPath();
			ctx.moveTo(pointx,pointy);
			ctx.lineTo(pointx2,pointy2);
			ctx.lineTo(pointx3,pointy3);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.moveTo(pointx4,pointy4);
			ctx.lineTo(pointx5,pointy5);
			ctx.lineTo(pointx6,pointy6);
			ctx.fill();
			ctx.closePath();
	}

}


window.onresize = function(event) {
	cw = ctx.width = c.width = window.innerWidth;
	ch = ctx.height = c.height = window.innerHeight;
	Te.top = ch*.90 + "px";
}

