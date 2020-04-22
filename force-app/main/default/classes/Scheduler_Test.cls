/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
class Scheduler_Test {
  @IsTest
  static void shouldThrowExceptionOnLoadWhenMissingPermissions() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    AuraHandledException auraException;

    Test.startTest();
    System.runAs(u) {
      try {
        Scheduler.init();
      } catch (AuraHandledException e) {
        auraException = e;
      }
    }
    Test.stopTest();

    System.assertNotEquals(
      null,
      auraException,
      'The method should have thrown an AuraHandledException'
    );
  }

  @IsTest
  static void shouldReturnListOfFlows() {
    Test.setMock(
      HttpCalloutMock.class,
      MockHttpResponse.builder()
        .contentType('application/json')
        .body(
          '{' +
          '"totalSize": 1,' +
          '"done": true,' +
          '"records": [' +
          '{' +
          '"attributes": {' +
          '"type": "FlowDefinitionView",' +
          '"url": "/services/data/v48.0/sobjects/FlowDefinitionView/300P00000008tgsIAA"' +
          '},' +
          '"Label": "Flowy McFlowface",' +
          '"ApiName": "Some_Flow",' +
          '"NamespacePrefix": "dcstuff"' +
          '},' +
          '{' +
          '"attributes": {' +
          '"type": "FlowDefinitionView",' +
          '"url": "/services/data/v48.0/sobjects/FlowDefinitionView/300P00000008tgsIAB"' +
          '},' +
          '"Label": "Even More Flow",' +
          '"ApiName": "Some__Other_Flow",' +
          '"NamespacePrefix": null' +
          '}' +
          ']' +
          '}'
        )
    );

    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    List<Map<String, Object>> flows;

    Test.startTest();
    System.runAs(u) {
      flows = (List<Map<String, Object>>) Scheduler.init();
      System.assert(!flows.isEmpty(), 'Expected a list of flows');
    }
    Test.stopTest();
  }

  @IsTest
  static void shouldGetMatchingClasses() {
    TestUtils.mockApexClasses();

    Test.startTest();
    System.assert(
      !Scheduler.getClasses('amp').isEmpty(),
      'Expected a list of classes'
    );
    Test.stopTest();
  }

  @IsTest
  static void shouldGetNoClasses() {
    TestUtils.mockNoApexClasses();

    Test.startTest();
    System.assert(
      Scheduler.getClasses('amp').isEmpty(),
      'Expected an empty list'
    );
    Test.stopTest();
  }

  @IsTest
  static void shouldLogErrorIfUserInactive() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      insert e;
    }

    u.IsActive = false;
    update u;

    Test.startTest();
    Scheduler.schedule(e.Name, e.Start__c, e.Id);
    e = [SELECT NumberOfExecutions__c FROM SchedulomaticEntry__c];
    System.assertEquals(0, e.NumberOfExecutions__c);
    Test.stopTest();

    SchedulomaticEntry__c res = [
      SELECT NumberOfExecutions__c, ExecutionError__c
      FROM SchedulomaticEntry__c
      WHERE Id = :e.Id
    ];
    System.assertEquals(0, res.NumberOfExecutions__c);
    System.assertEquals(
      Scheduler.EXECUTION_ERROR_INACTIVE_OWNER,
      res.ExecutionError__c
    );
  }

  @IsTest
  static void shouldLogErrorIfMissingPermissions() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      insert e;
    }

    Test.startTest();
    Scheduler.schedule(e.Name, e.Start__c, e.Id);
    e = [SELECT NumberOfExecutions__c FROM SchedulomaticEntry__c];
    System.assertEquals(0, e.NumberOfExecutions__c);
    Test.stopTest();

    SchedulomaticEntry__c res = [
      SELECT NumberOfExecutions__c, ExecutionError__c
      FROM SchedulomaticEntry__c
      WHERE Id = :e.Id
    ];
    System.assertEquals(0, res.NumberOfExecutions__c);
    System.assertEquals(
      Scheduler.EXECUTION_ERROR_MISSING_PERMISSIONS,
      res.ExecutionError__c
    );
  }

  @IsTest
  static void shouldNotCrashIfEntryIsDeleted() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      insert e;
    }

    delete e;

    Test.startTest();
    Scheduler.schedule(e.Name, e.Start__c, e.Id);
    Test.stopTest();

    System.assertEquals(0, [SELECT COUNT() FROM SchedulomaticEntry__c]);
  }

  @IsTest
  static void shouldExecuteJobOnce() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      insert e;

      Test.startTest();
      Scheduler.schedule(e.Name, e.Start__c, e.Id);
      e = [SELECT Start__c, NumberOfExecutions__c FROM SchedulomaticEntry__c];
      System.assertEquals(0, e.NumberOfExecutions__c);
      Test.stopTest();
    }

    SchedulomaticEntry__c res = [
      SELECT Start__c, NumberOfExecutions__c
      FROM SchedulomaticEntry__c
      WHERE Id = :e.Id
    ];
    System.assertEquals(e.Start__c, res.Start__c);
    System.assertEquals(1, res.NumberOfExecutions__c);
  }

  @IsTest
  static void shouldExecuteJobOnceAndRescheduleIn5() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      e.RepeatInterval__c = 5;
      insert e;

      Test.startTest();
      Scheduler.schedule(e.Name, e.Start__c, e.Id);
      Test.stopTest();
    }

    SchedulomaticEntry__c res = [
      SELECT Start__c
      FROM SchedulomaticEntry__c
      WHERE Id = :e.Id
    ];
    System.assertEquals(
      Datetime.now().addMinutes(5).minute(),
      res.Start__c.minute()
    );
  }

  @IsTest
  static void shouldExecuteJobOnceAndRescheduleForTomorrow() {
    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    SchedulomaticEntry__c e;

    System.runAs(u) {
      e = TestUtils.getStarterEntry();
      e.IsDaily__c = true;
      insert e;

      Test.startTest();
      Scheduler.schedule(e.Name, e.Start__c, e.Id);
      Test.stopTest();
    }

    SchedulomaticEntry__c res = [
      SELECT Start__c, DailyStartDateTime__c
      FROM SchedulomaticEntry__c
      WHERE Id = :e.Id
    ];
    System.assertEquals(e.Start__c.addDays(1), res.Start__c);
    System.assertEquals(
      e.DailyStartDateTime__c.addDays(1),
      res.DailyStartDateTime__c
    );
  }

  @IsTest
  static void shouldKnowIfItShouldRunAgainToday() {
    Scheduler s = new Scheduler(null);

    s.entry = TestUtils.getStarterEntry();
    System.assert(s.isBeforeOrNoEndDateTime());

    s.entry.End__c = Datetime.now().addDays(1);
    System.assert(s.isBeforeOrNoEndDateTime());

    s.entry.IsDaily__c = true;
    System.assert(s.isBeforeOrNoEndDateTime());

    s.entry.DailyEnd__c = Date.today().addDays(2);
    System.assert(s.isBeforeOrNoEndDateTime());

    s.entry.DailyEnd__c = Date.today().addDays(-1);
    System.assert(!s.isBeforeOrNoEndDateTime());

    s.entry.End__c = Datetime.now().addDays(-1);
    System.assert(!s.isBeforeOrNoEndDateTime());
  }

  @IsTest
  static void shouldEvaluateDoublesCorrectly() {
    Scheduler s = new Scheduler(null);

    Double d1 = null;
    Double d2 = -1;
    Double d3 = 0;
    Double d4 = 1;

    System.assert(!s.isPositiveInteger(d1));
    System.assert(!s.isPositiveInteger(d2));
    System.assert(!s.isPositiveInteger(d3));
    System.assert(s.isPositiveInteger(d4));
  }

  @IsTest
  static void shouldEvaluateDecimalsCorrectly() {
    Scheduler s = new Scheduler(null);

    Decimal d1 = null;
    Decimal d2 = -1;
    Decimal d3 = 0;
    Decimal d4 = 1;

    System.assert(!s.isPositiveInteger(d1));
    System.assert(!s.isPositiveInteger(d2));
    System.assert(!s.isPositiveInteger(d3));
    System.assert(s.isPositiveInteger(d4));
  }

  @IsTest
  static void shouldIncrementExecutionsBy1() {
    Scheduler s = new Scheduler(null);

    s.entry = TestUtils.getStarterEntry();
    s.incrementExecutions();
    System.assertEquals(1, s.entry.NumberOfExecutions__c);

    s.incrementExecutions();
    System.assertEquals(2, s.entry.NumberOfExecutions__c);
  }

  @IsTest
  static void shouldRescheduleForTomorrow() {
    Scheduler s = new Scheduler(null);
    Datetime start = Datetime.now().addMinutes(5);
    Datetime endd = Datetime.now().addDays(1);

    ScheduloMaticEntry__c e = TestUtils.getStarterEntry();
    e.Start__c = start;
    e.DailyStartDateTime__c = start;
    e.End__c = endd;
    insert e;
    s.entry = e;

    s.rescheduleForTomorrow();
    System.assertEquals(start.addDays(1), s.entry.Start__c);
    System.assertEquals(start.addDays(1), s.entry.DailyStartDateTime__c);
    System.assertEquals(endd.addDays(1), s.entry.End__c);
  }

  @IsTest
  static void shouldExecuteAnonymousWithoutCrashing() {
    Test.setMock(HttpCalloutMock.class, MockHttpResponse.builder());

    User u = TestUtils.createStandardUser('blah');
    insert u;

    TestUtils.assignPermissions(u);

    Test.startTest();
    System.runAs(u) {
      Scheduler.executeAnonymous('System.debug(\'hey!\')');
    }
    Test.stopTest();
  }
}
