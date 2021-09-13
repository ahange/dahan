import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { authHeaderForUser, clearDB, createApplication, createUser, createNestAppInstance, createApplicationVersion } from '../test.helper';

describe('apps controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    await clearDB();
  });

  beforeAll(async () => {
    app = await createNestAppInstance();
  });

  it('should allow only authenticated users to update app params', async () => {
    await request(app.getHttpServer()).put('/apps/uuid').expect(401);
  });

  it('should be able to update name of the app if admin of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { user: adminUserData.user });

    const response = await request(app.getHttpServer())
      .put(`/apps/${application.id}`)
      .set('Authorization', authHeaderForUser(adminUserData.user))
      .send({ app: { name: 'new name' } });

    expect(response.statusCode).toBe(200);
    await application.reload();
    expect(application.name).toBe('new name');
  });

  it('should not be able to update name of the app if admin of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    const response = await request(app.getHttpServer())
      .put(`/apps/${application.id}`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))
      .send({ app: { name: 'new name' } });

    expect(response.statusCode).toBe(403);
    await application.reload();
    expect(application.name).toBe('name');
    
  });

  it('should not allow developers and viewers to change the name of apps', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    const developerUserData = await createUser(app, { email: 'dev@tooljet.io', role: 'developer', organization: adminUserData.organization });
    const viewerUserData = await createUser(app, { email: 'viewer@tooljet.io', role: 'viewer', organization: adminUserData.organization });

    let response = await request(app.getHttpServer())
      .put(`/apps/${application.id}`)
      .set('Authorization', authHeaderForUser(developerUserData.user))
      .send({ app: { name: 'new name' } });
    expect(response.statusCode).toBe(403);

    response = await request(app.getHttpServer())
      .put(`/apps/${application.id}`)
      .set('Authorization', authHeaderForUser(viewerUserData.user))
      .send({ app: { name: 'new name' } });
    expect(response.statusCode).toBe(403);

    await application.reload();
    expect(application.name).toBe('name');
  });

  it('should allow only authenticated users to access app users endpoint', async () => {
    await request(app.getHttpServer()).get('/apps/uuid/users').expect(401);
  });

  it('should not be able to fetch app users if admin of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    const response = await request(app.getHttpServer())
      .get(`/apps/${application.id}/users`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))

    expect(response.statusCode).toBe(403);
    
  });

  it('should not be able to fetch app versions if user of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });
    await createApplicationVersion(app, application);

    const response = await request(app.getHttpServer())
      .get(`/apps/${application.id}/versions`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))

    expect(response.statusCode).toBe(403);
    
  });

  it('should be able to fetch app versions if admin/developer/viewer of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const organization = adminUserData.organization;
    const developerUserData = await createUser(app, { email: 'developer@tooljet.io', role: 'developer', organization });
    const viewerUserData = await createUser(app, { email: 'viewer@tooljet.io', role: 'viewer', organization });

    const application = await createApplication(app, { name: 'name', user: adminUserData.user });
    await createApplicationVersion(app, application);

    for( const userData of [adminUserData, developerUserData, viewerUserData]) {
      const response = await request(app.getHttpServer())
        .get(`/apps/${application.id}/versions`)
        .set('Authorization', authHeaderForUser(userData.user))

      expect(response.statusCode).toBe(200);
      expect(response.body.versions.length).toBe(1);
    }
    
  });

  it('should be able to fetch app users if admin/developer/viewer of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const organization = adminUserData.organization;
    const developerUserData = await createUser(app, { email: 'developer@tooljet.io', role: 'developer', organization });
    const viewerUserData = await createUser(app, { email: 'viewer@tooljet.io', role: 'viewer', organization });

    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    for( const userData of [adminUserData, developerUserData, viewerUserData]) {
      const response = await request(app.getHttpServer())
        .get(`/apps/${application.id}/users`)
        .set('Authorization', authHeaderForUser(userData.user))

      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBe(1);
    }
    
  });

  it('should be able to create a new app version if admin or developer of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const developerUserData = await createUser(app, { email: 'dev@tooljet.io', role: 'developer', organization: adminUserData.organization });
    const application = await createApplication(app, { user: adminUserData.user });

    for( const userData of [adminUserData, developerUserData]) {
      const response = await request(app.getHttpServer())
        .post(`/apps/${application.id}/versions`)
        .set('Authorization', authHeaderForUser(userData.user))
        .send({ 
          versionName: 'v0'
        });

      expect(response.statusCode).toBe(201);
    }

  });

  it('should not be able to create app versions if user of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });
    await createApplicationVersion(app, application);

    const response = await request(app.getHttpServer())
      .post(`/apps/${application.id}/versions`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))
      .send({ 
        versionName: 'v0'
    });

    expect(response.statusCode).toBe(403);
    
  });

  it('should not be able to fetch app versions if user is a viewer', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const viewerUserData = await createUser(app, { email: 'viewer@tooljet.io', role: 'viewer', organization: adminUserData.organization });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });
    await createApplicationVersion(app, application);

    const response = await request(app.getHttpServer())
      .post(`/apps/${application.id}/versions`)
      .set('Authorization', authHeaderForUser(viewerUserData.user))
      .send({ 
        versionName: 'v0'
      });

    expect(response.statusCode).toBe(403);
    
  });

  it('should be able to update app version if admin or developer of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const developerUserData = await createUser(app, { email: 'dev@tooljet.io', role: 'developer', organization: adminUserData.organization });
    const application = await createApplication(app, { user: adminUserData.user });
    const version = await createApplicationVersion(app, application);

    for( const userData of [adminUserData, developerUserData]) {
      const response = await request(app.getHttpServer())
        .put(`/apps/${application.id}/versions/${version.id}`)
        .set('Authorization', authHeaderForUser(userData.user))
        .send({ 
          definition: { components: [] }
        });

      expect(response.statusCode).toBe(200);
      await version.reload();
    }

  });

  it('should not be able to update app version if viewers of same organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const viewerUserData = await createUser(app, { email: 'dev@tooljet.io', role: 'viewer', organization: adminUserData.organization });
    const application = await createApplication(app, { user: adminUserData.user });
    const version = await createApplicationVersion(app, application);

    const response = await request(app.getHttpServer())
      .put(`/apps/${application.id}/versions/${version.id}`)
      .set('Authorization', authHeaderForUser(viewerUserData.user))
      .send({ 
        definition: { components: [] }
      });

    expect(response.statusCode).toBe(403);

  });

  it('should not be able to update app versions if user of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });
    const version = await createApplicationVersion(app, application);

    const response = await request(app.getHttpServer())
      .put(`/apps/${application.id}/versions/${version.id}`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))
      .send({ 
        definition: { components: [] }
      });

    expect(response.statusCode).toBe(403);
    
  });

  /* 
    Viewing app on app viewer 
    All org users can launch an app 
    Public apps can be launched by anyone ( even unauthenticated users )
    By view app endpoint, we assume the apps/slugs/:id endpoint
  */

  it('should be able to fetch app using slug if member of an organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const developerUserData = await createUser(app, { email: 'developer@tooljet.io', role: 'developer', organization: adminUserData.organization });
    const viewerUserData = await createUser(app, { email: 'viewer@tooljet.io', role: 'viewer', organization: adminUserData.organization });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    for(const userData of [adminUserData, developerUserData, viewerUserData]) {
      const response = await request(app.getHttpServer())
        .get(`/apps/slugs/${application.slug}`)
        .set('Authorization', authHeaderForUser(userData.user))

      expect(response.statusCode).toBe(200);
    }
  });
  
  it('should not be able to fetch ap using slug if member of another organization', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const anotherOrgAdminUserData = await createUser(app, { email: 'another@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user });

    const response = await request(app.getHttpServer())
      .get(`/apps/slugs/${application.slug}`)
      .set('Authorization', authHeaderForUser(anotherOrgAdminUserData.user))

    expect(response.statusCode).toBe(403);
  });

  it('should be able to fetch app using slug if a public app ( even if unauthenticated )', async () => {

    const adminUserData = await createUser(app, { email: 'admin@tooljet.io', role: 'admin' });
    const application = await createApplication(app, { name: 'name', user: adminUserData.user, isPublic: true });

    const response = await request(app.getHttpServer())
      .get(`/apps/slugs/${application.slug}`)

    expect(response.statusCode).toBe(200);

  });


  afterAll(async () => {
    await app.close();
  });
});
