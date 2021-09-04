const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const endPoint = '/api/issues/testapi';
let id;

suite('Functional Tests', function () {
  // ----------------------------------POST suite
  suite('POST request to /api/issues/{project}', function () {
    test('Create an issue with every field', function (done) {
      chai
        .request(server)
        .post(endPoint)
        .send({
          issue_title: 'testing api',
          issue_text: 'these are example text',
          created_by: 'chai',
          assigned_to: 'chai & mocha',
          status_text: 'nothing',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          id = res.body._id;

          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'status_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'testing api');
          assert.equal(res.body.issue_text, 'these are example text');
          assert.equal(res.body.created_by, 'chai');
          assert.equal(res.body.assigned_to, 'chai & mocha');
          assert.equal(res.body.status_text, 'nothing');
          assert.isBoolean(res.body.open);
          assert.isTrue(res.body.open);
          done();
        });
    });

    test('Create an issue with only required fields', function (done) {
      chai
        .request(server)
        .post(endPoint)
        .send({
          issue_title: 'testing api',
          issue_text: 'these are example text',
          created_by: 'chai',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);

          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'status_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'testing api');
          assert.equal(res.body.issue_text, 'these are example text');
          assert.equal(res.body.created_by, 'chai');
          assert.isBoolean(res.body.open);
          assert.isTrue(res.body.open);
          done();
        });
    });

    test('Create an issue with missing required fields', function (done) {
      chai
        .request(server)
        .post(endPoint)
        .send({
          issue_title: 'testing api',
          issue_text: 'these are example text',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });
  // ----------------------------------GET suite
  suite('GET request to /api/issues/{project}', function () {
    test('View issues on a project', function (done) {
      chai
        .request(server)
        .get(endPoint)
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);

          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], '_id');
          done();
        });
    });

    test('View issues on a project with one filter', function (done) {
      chai
        .request(server)
        .get(endPoint)
        .query({ created_by: 'chai' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].created_by, 'chai');
          done();
        });
    });

    test('View issues on a project with multiple filters', function (done) {
      chai
        .request(server)
        .get(endPoint)
        .query({ created_by: 'chai', open: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].created_by, 'chai');
          assert.isTrue(res.body[0].open);
          done();
        });
    });
  });
  // ----------------------------------PUT suite
  suite('PUT request to /api/issues/{project}', function () {
    test('Update one field on an issue', function (done) {
      chai
        .request(server)
        .put(endPoint)
        .send({ _id: id, issue_text: 'test update' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'result');
          assert.property(res.body, '_id');
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update multiple fields on an issue', function (done) {
      chai
        .request(server)
        .put(endPoint)
        .send({ _id: id, issue_text: 'test update', issue_title: 'test title' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'result');
          assert.property(res.body, '_id');
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update an issue with missing _id', function (done) {
      chai
        .request(server)
        .put(endPoint)
        .send({ issue_text: 'test update', issue_title: 'test title' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function (done) {
      chai
        .request(server)
        .put(endPoint)
        .send({ _id: id })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
    test('Update an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .put(endPoint)
        .send({ _id: '3lsdco', issue_text: 'test test' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'invalid _id');
          done();
        });
    });
  });
  // ----------------------------------DELETE suite
  suite('DELETE request to /api/issues/{project}', function () {
    test('Delete an issue', function (done) {
      chai
        .request(server)
        .delete(endPoint)
        .send({ _id: id })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });
    test('Delete an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .delete(endPoint)
        .send({ _id: '39cls3kcw' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
    test('Delete an issue with missing _id', function (done) {
      chai
        .request(server)
        .delete(endPoint)
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
