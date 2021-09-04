'use strict';
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Issue, Project } = require('../DB/model');

module.exports = function(app) {
	require('../DB/dbconnect');
	app
		.route('/api/issues/:project')

		.get(async function(req, res) {
			let project = req.params.project;

			let { assigned_to, open, created_by, issue_text, issue_title, status_text } = req.query;
			open = open === 'false' ? false : true;

			const pdata = await Project.aggregate([
				{ $match: { name: project } },
				{ $unwind: '$issues' },
				open != undefined ? { $match: { 'issues.open': open } } : { $match: {} },
				assigned_to != undefined
					? { $match: { 'issues.assigned_to': assigned_to } }
					: { $match: {} },
				created_by != undefined ? {$match:{'issues.created_by':created_by}}:{$match:{}},
				issue_title != undefined ? {$match:{'issues.issue_title':issue_title}}:{$match:{}},
				issue_text != undefined ? {$match:{'issues.issue_text':issue_text}}:{$match:{}},
				status_text != undefined ? {$match:{'issues.status_text':status_text}}:{$match:{}},
			]);
			if (!pdata) {
				res.json([]);
				return;
			}
			const mappedData = pdata.map((item) => item.issues);
			res.json(mappedData);
		})

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

		.put(async function(req, res) {
			let project = req.params.project;

			const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } =
				req.body;

			if (!_id) {
				res.json({ error: 'missing _id' });
				return;
			}
			if(!/[a-fA-F0-9]{24}/.test(_id)){
				res.json({ error: 'invalid _id', _id: _id });
				return;
			}

			const id = ObjectId(_id);

			if (
				!issue_title &&
				!issue_text &&
				!created_by &&
				!assigned_to &&
				!status_text
			) {
				res.json({ error: 'no update field(s) sent', _id: id });
				return;
			}
			const pdata = await Project.findOne({ name: project });
			if (!pdata) {
				res.json({ error: 'project does not exist' });
				return;
			}
			const nestedData = await pdata.issues.id(id);
			if (!nestedData) {
				res.json({ error: 'invalid _id', _id: id });
				return;
			}

			nestedData.issue_text = issue_text || nestedData.issue_text;
			nestedData.issue_title = issue_title || nestedData.issue_title;
			nestedData.created_by = created_by || nestedData.created_by;
			nestedData.assigned_to = assigned_to || nestedData.assigned_to;
			nestedData.status_text = status_text || nestedData.status_text;
			nestedData.open = open === 'false' ? false : true;
			nestedData.updated_on = new Date();

			const result = await pdata.save();

			if (!result) {
				res.json({ error: 'could not update', _id: id });
				return;
			}
			res.json({ result: 'successfully updated', _id: id });
		})

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
				res.json({ error: 'could not delete', _id: _id });
				return;
			}
			nestedData.remove();

			const result = await pdata.save();

			if (!result) {
				res.json({ error: 'could not delete', _id: _id });
				return;
			}
			res.json({ result: 'successfully deleted', _id: _id });
		});
};
