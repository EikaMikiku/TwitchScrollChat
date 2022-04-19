const params = new URLSearchParams(window.location.search);
const channel = params.get("channel") || "forsen";
const fontSize = params.get("fontSize") || "20px";
const fontColor = params.get("color") || "white";
const fontFamily = params.get("fontFamily") || "sans-serif";
const speed = params.get("speed") || 0.5;
const bg = params.get("bg") || null;
const msgLimit = params.get("msgLimit") || 5;
const charLimit = params.get("charLimit") || 75;
const emoteSize = params.get("emoteSize") || "1";

const client = new tmi.Client({
	connection: {
		secure: true,
		reconnect: true,
	},
	channels: [channel],
});

client.connect().then(() => {
	console.log("Connected.");
	if(bg) {
		document.body.style.backgroundColor = "#" + bg;
	}
	setInterval(move);
});

client.on("message", (channel, info, message) => {
	let divs = document.querySelectorAll("body > div");
	if(divs.length > msgLimit) {
		return; //Limit reached, ignore this one
	}

	if(message.length > charLimit) {
		message = message.substring(0, charLimit) + "...";
	}

	let nick = info["display-name"];
	let nick_color = info["color"];
	let nick_span = document.createElement("span");
	nick_span.style.color = nick_color;
	nick_span.innerText = nick;
	nick_span.className = "nick";

	let msg_span = buildMessageSpanHTML(info, message);
	msg_span.className = "msg";

	let div = document.createElement("div");
	div.style.fontFamily = fontFamily;
	div.style.fontSize = fontSize;
	div.style.lineHeight = fontSize;
	div.style.color = fontColor;
	div.appendChild(nick_span);
	div.appendChild(msg_span);
	div.style.left = window.innerWidth + "px";

	let height = (window.innerHeight - parseFloat(fontSize)) * Math.random();
	div.style.top = height + "px";

	document.body.appendChild(div);
});

function buildMessageSpanHTML(info, message) {
	let span = document.createElement("span");

	let sorted = [];
	for(let emote in info.emotes) {
		let locs = info.emotes[emote];
		for(let i = 0; i < locs.length; i++) {
			let start = parseInt(locs[i]);
			if(start > charLimit - 3) { //3 for ...
				continue;
			}

			sorted.push({
				"loc": locs[i],
				"emote": emote
			});
		}
	}
	sorted.sort((a,b) => {
		return parseInt(b.loc) - parseInt(a.loc);
	});

	let html = message;
	for(let i = 0; i < sorted.length; i++) {
		let obj = sorted[i];
		let emoteTop = parseInt(parseInt(fontSize) / 3);
		let img = `<img class="emote" style="top:${emoteTop}px" src="https://static-cdn.jtvnw.net/emoticons/v2/${obj.emote}/default/dark/${emoteSize}.0">`;
		let loc = obj.loc.split("-");

		message = message.slice(0, parseInt(loc[0])) + img + message.slice(parseInt(loc[1]) + 1);
	}

	span.innerHTML = message;

	return span;
}

function move() {
	let divs = document.querySelectorAll("body > div");

	for(let i = 0; i < divs.length; i++) {
		let d = divs[i];
		let right = d.offsetLeft + d.offsetWidth;
		if(right < 0) {
			document.body.removeChild(d);
		} else {
			let newLeft = parseFloat(d.style.left) - speed;
			d.style.left = newLeft + "px";
		}

	}
}
