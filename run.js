request=require("request");
fs=require("fs");

var result={};
function add_item(deck) {
	if(!result[deck]){
		result[deck]=1;
	} else {
		result[deck]++;
	}
}

function get(path, callback) {
	const raw=fs.readFileSync(path, "utf8");
	var result;
	request.post({
		url:"https://api.mycard.moe/ygopro/identifier/production",
		form:{deck:raw}
	}, function(error, response, body) {
		if(error){
			return null;
		}
		const res=JSON.parse(body).deck;
		callback(res);
	});
}

const decks_list = fs.readdirSync("./deck");

console.log(decks_list.length + " decks.");

var done = 0;

for (var k in decks_list) {
	const deck=decks_list[k];
	get("./deck/"+deck, function(res) {
		done++;
		if(res) {
			console.log(deck+" --> "+res);
			add_item(res);
		}else{
			console.log("ERROR: "+deck);
		}
		if(done==decks_list.length) {
			console.log("Finished.");
			console.log(result);
		}
	})
}