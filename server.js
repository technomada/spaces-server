//
// spaces server -- 2019.11.07
//

const uuidv4 = require('uuid/v4')

const 	Spaces = // 2018.08.02 <| 2018.06.24.1700 
	module.exports = function(opts){

		var series = uuidv4()
		var stats = {}

		if(!opts)
			opts = {}

		var max_results = opts.max_results || 15
		var timeout = opts.timeout || 30

		var spaces = {}
		const sureSpace = n=>{
			if(!spaces[n])
				spaces[n] = {offset:1,messages:[],waits:[]}

			return spaces[n]
			}

		Object.defineProperty(this,'series',{get:n=>series})

		//better for super lib to cancel waits.. or not notify here etc?
		this.wait = (n,since)=>new Promise((res,rej)=>{
			var s = sureSpace(n)
			var len = s.messages.length

			var top = len+s.offset-1

			if(typeof(since) === 'undefined')
				since = top

			
			if(since < top){
				let from = since-s.offset+1
				let list = s.messages.slice(from,from+max_results)
				let newSince = since+list.length-1+s.offset
				res({list,since:newSince,series})
				}
			else {
				s.waits.push({cb:n=>{
					res(n)
					},
					since,
					udate: Date.now()/1000})
				}
			})

		this.unwait = (n,cb)=>{}

		this.put = (n,m)=>{
			var s = sureSpace(n)

			s.messages.push(m)

			var item = (s.messages.length-1)+s.offset

			flush(s)

			return {item,series}
			}//func

		this.about = n=>{ // upg: async for stats
			var s = sureSpace(n)
			var len = s.messages.length
			var since = len+s.offset-1

			return {since,series,stats:false}
			}


		const flush = n=>{ // n = space object (not space name)

			var t = n.messages.length-1+n.offset
			var l = []
			var ago = (Date.now()/1000)-timeout // smallest allowed udate

			n.waits.forEach(v=>{
				if(v.udate < ago){
				// drop
				v.cb({list:false,since:v.since,series})
				 }
				else
				if(v.since < t){
					let from = v.since-n.offset+1
					let list = n.messages.slice(from,from+max_results) 
					let since = v.since+(list.length-1)+n.offset
					v.cb({list,since,series})
					}
				else
					{l.push(v)
					}
				})

			n.waits = l
			}
	}// functiom



;(async function(){
	const express = require('express')
	const cors = require('cors')
	const { PerformanceObserver, performance } = require('perf_hooks');
	

	const PORT = 3000
	const MAX_LEN = 5000  // per ip?  (upg> max this.) .. also maybe throttle it down. could hash with salt .. and dump after 30 mins of not use  seperate plugin system..

	const app = express()

	app.use(cors())

	var spaces = new Spaces()


	app.all(['/put/:xid'],async(req,res)=>{
		var p = req.params
		var q = req.query
		
		let xid = p.xid
		let body = q.body // upg: json post (but if body is small this should be ok?  good for testing

		var item = spaces.put(xid,body)

		res.json(item) 
		})


	app.all(['/about/:xid'],async(req,res)=>{
		var p = req.params
		var q = req.query
		
		let xid = p.xid

		var r = spaces.about(xid)

		res.json(r)
		})
	


	app.all(['/get/:xid','/get/:xid/:since'],async(req,res)=>{
		var p = req.params
		var q = req.query
		
		let xid = p.xid
		let since = typeof(p.since)!='undefined'?parseInt(p.since):p.since

		var tFrom = performance.now() //upg: do security in all (so can't guess by timing)

		let done = false // upg: spaces cancel wait.
		var t = setTimeout(n=>{ // this ok?
			done = true
			res.json({list:false,since,series:spaces.series})
			},20000) // upg timer?

		// upg: set a timer and cancel wait after n-seconds?
		spaces.wait(xid,since).then(v=>{
			//var dt = performance.now()-tFrom
			if(!done)
				res.json(v)
			clearTimeout(t)
			}).catch(e=>{
				if(!done)
					res.json(false)
				clearTimeout(t)
				})

		})


	//upg: cleaning older than 30 seconds?
	
	/////////////////////////////////////////////////
	//
	var r = await app.listen(PORT)

	console.log('listening',PORT)
	})();
