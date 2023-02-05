const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

// Test cases for logged-in user
describe('Blog API (logged-in user)', () => {
  let token;
  let postId;

  it('should login'  ,(done) => {
     chai.request(app)
      .post('/api/login')
      .send({ username: 'test', token: 'test123' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        token = res.body.accessToken;
        console.log(token);
        done();
      });
  });

  it('should create a new blog post',  (done) => {
     chai.request(app)
      .post('/api/createpost')
      .set('Authorization', `bearer ${token}`)
      .send({ title: 'Test Post', description: 'Test Content' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Post created successfully');
        postId = res.body.postid;
        console.log(postId);
        done();
      });
  });

  it('should update an existing blog post', (done) => {
    chai.request(app)
      .put(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Test Post', description: 'Updated Test Content' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Post updated successfully');
        done();
      });
  });

  it('should delete an existing blog post', (done) => {
    chai.request(app)
      .delete(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('Post deleted successfully');
        done();
      });
  });
});

// Test cases for logged-out user
describe('Blog API (logged-out user)', () => {
  it('should not be able to create a new blog post', (done) => {
    chai.request(app)
      .post('/api/createpost')
      .send({ title: 'Test Post', content: 'Test Content' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Token not provided');
        done();
      });
  });

  it('should not be able to update an existing blog post', (done) => {
    chai.request(app)
      .put('/api/post/12345')
      .send({ title: 'Updated Test Post', content: 'Updated Test Content'})
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Token not provided');
        done();
      })
  })


  it('should not be able to delete an existing blog post', (done) => {
    chai.request(app)
      .delete('/api/post/12345')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equal('Token not provided');
        done();
      });
  });

});