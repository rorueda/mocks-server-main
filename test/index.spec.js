import {
  readAbout,
  readBehaviors,
  readBehavior,
  readFixtures,
  readFixture,
  readSettings,
  updateSettings,
} from "./index";

describe("react-admin-client methods used through node", () => {
  describe("whe reading about", () => {
    it("should return current version", async () => {
      const about = await readAbout();
      expect(about.version).toBeDefined();
    });
  });

  describe("whe reading fixtures", () => {
    it("should return current fixtures collection", async () => {
      const fixtures = await readFixtures();
      expect(fixtures.length).toEqual(2);
    });

    it("first fixture model should exist", async () => {
      const fixtures = await readFixtures();
      const fixtureId = fixtures[0].id;
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });

    it("second fixture model should exist", async () => {
      const fixtures = await readFixtures();
      const fixtureId = fixtures[1].id;
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });
  });

  describe("whe reading behaviors", () => {
    it("should return behaviors collection", async () => {
      const behaviors = await readBehaviors();
      expect(behaviors.length).toEqual(2);
    });

    it("first behavior model should exist", async () => {
      const behaviors = await readBehaviors();
      const behaviorName = behaviors[0].name;
      const behavior = await readBehavior(behaviorName);
      expect(behavior.name).toEqual(behaviorName);
    });

    it("second behavior model should exist", async () => {
      const behaviors = await readBehaviors();
      const behaviorName = behaviors[1].name;
      const behavior = await readBehavior(behaviorName);
      expect(behavior.name).toEqual(behaviorName);
    });

    it("fixture of behavior base should exist", async () => {
      const behaviors = await readBehaviors();
      const fixtureId = behaviors[0].fixtures[0];
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });

    it("first fixture of behavior user2 should exist", async () => {
      const behaviors = await readBehaviors();
      const fixtureId = behaviors[1].fixtures[0];
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });

    it("first fixture of behavior user2 should exist", async () => {
      const behaviors = await readBehaviors();
      const fixtureId = behaviors[1].fixtures[0];
      const fixture = await readFixture(fixtureId);
      expect(fixture.id).toEqual(fixtureId);
    });
  });

  describe("whe reading settings", () => {
    it("should return current behavior", async () => {
      const settings = await readSettings();
      expect(settings.behavior).toEqual("base");
    });

    it("current behavior should exist", async () => {
      const settings = await readSettings();
      const currentBehavior = await readBehavior(settings.behavior);
      expect(currentBehavior.name).toEqual(settings.behavior);
    });
  });

  describe("whe updating settings", () => {
    it("should update current behavior", async () => {
      await updateSettings({
        behavior: "user2",
      });
      const settings = await readSettings();
      expect(settings.behavior).toEqual("user2");
    });

    it("should update current delay", async () => {
      await updateSettings({
        delay: 1000,
      });
      const settings = await readSettings();
      expect(settings.delay).toEqual(1000);
    });

    it("should update current behavior", async () => {
      await updateSettings({
        behavior: "base",
      });
      const settings = await readSettings();
      expect(settings.behavior).toEqual("base");
    });
  });
});
