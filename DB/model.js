const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  created_on: { type: Date, required: true },
  updated_on: { type: Date, required: true },
  open: { type: Boolean, required: true },
});

const Issue = new mongoose.model('issue', IssueSchema);

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issues: [IssueSchema],
});

const Project = new mongoose.model('project', ProjectSchema);

module.exports = { Issue, Project };
