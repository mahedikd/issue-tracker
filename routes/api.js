'use strict';
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Issue, Project } = require('../DB/model');

module.exports = function(app) {
	require('../DB/dbconnect');
	app
		.route('/api/issues/:project')
// ####################[ GET ]####################
		.get(async function(req, res) {
			let project = req.params.project;

			let { _id, assigned_to, open, created_by, issue_text, issue_title, status_text } = req.query;
			open = open === 'false' ? false : true;

			const pdata = await Project.aggregate([
				{ $match: { name: project } },
				{ $unwind: '$issues' },
				_id != undefined ? { $match: { 'issues.open': open } } : { $match: {} },
				open != undefined ? { $match: { 'issues.open': open } } : { $match: {} },
				created_by != undefined ? { $match: { 'issues.created_by': created_by } } : { $match: {} },
				assigned_to != undefined
					? { $match: { 'issues.assigned_to': assigned_to } }
					: { $match: {} },
				issue_title != undefined ? { $match: { 'issues.issue_title': issue_title } } : { $match: {} },
				issue_text != undefined ? { $match: { 'issues.issue_text': issue_text } } : { $match: {} },
				status_text != undefined ? { $match: { 'issues.status_text': status_text } } : { $match: {} },
			]);
			if (!pdata) {
				res.json([]);
				return;
			}
			const mappedData = pdata.map((item) => item.issues);
			res.json(mappedData);
		})
// ####################[ POST ]####################
		.post(async function(req, res) {
			let project = req.params.project;

			const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
			if (!issue_title || !issue_text || !created_by) {
				res.json({ error: 'required field(s) missing' });
				return;
			}

			const newIssue = new Issue({
				issue_title,
				issue_text,
				created_by,
				assigned_to: assigned_to || '',
				status_text: status_text || '',
				created_on: new Date(),
				updated_on: new Date(),
				open: true,
			});
			const pdata = await Project.findOne({ name: project });
			let newProject;
			if (!pdata) {
				await Project.create({ name: project });
			}
			const result = await Project.findOneAndUpdate(
				{ name: project },
				{ $push: { issues: newIssue } },
			);

			if (!result) {
				res.send('there was an error saving data in post');
				return;
			}
			res.json(newIssue);
		})
// ####################[ PUT ]####################
		.put(async function(req, res) {
			let project = req.params.project;

			const _id = req.body._id;

			if (!_id) {
				res.json({ error: 'missing _id' });
				return;
			}

			let updateObj = {}

			Object.keys(req.body).forEach(key => {
				if (req.body[key] != "") {
					updateObj[key] = req.body[key]
				}
			})
			if (Object.keys(updateObj).length < 2) {
				return res.json({ error: 'no update field(s) sent', _id });
			}
			updateObj['updated_on'] = new Date();

			const pdata = await Project.findOne({ name: project });

			const nestedData = await pdata.issues.id(_id);
			if (!nestedData) {
				return res.json({ error: 'could not update', _id });
			}

			Object.keys(updateObj).forEach(key => {
				nestedData[key] = updateObj[key];
			})

			pdata.save((err, data) => {
				if (err) {
					res.json({ error: 'could not update', _id });
				} else {
					res.json({ result: 'successfully updated', '_id': _id });
				}
			});

		})
// ####################[ DELETE ]####################
		.delete(async function(req, res) {
			let project = req.params.project;

			const { _id } = req.body;

			if (!_id) {
				res.json({ error: 'missing _id' });
				return;
			}

			const pdata = await Project.findOne({ name: project });
			if (!pdata) {
				res.json({ error: 'project does not exist' });
				return;
			}
			const nestedData = await pdata.issues.id(_id);
			if (!nestedData) {
				res.json({ error: 'could not delete', _id });
				return;
			}
			nestedData.remove();

			const result = await pdata.save();

			if (!result) {
				res.json({ error: 'could not delete', _id });
				return;
			}
			res.json({ result: 'successfully deleted', _id });
		});
};
