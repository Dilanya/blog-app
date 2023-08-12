const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types; 

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		min: 3,
		max: 1600,
		required: true
	},
	body: {
		type: {},
		required: true,
		min: 200,
		max: 5000000
	},
	username:{
		type:String,
		required:true,
	},
	created: {type: Date, default: Date.now}
});
blogSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model("Blog", blogSchema);

