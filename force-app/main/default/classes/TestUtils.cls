/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public class TestUtils {
  static Profile standardUserProfile;
  static PermissionSet thePermissionSet;

  public static User createStandardUser(String name) {
    return createTestUser(name, getStandardUserProfile());
  }

  static Profile getStandardUserProfile() {
    if (standardUserProfile == null) {
      standardUserProfile = getProfile('Standard User');
    }
    return standardUserProfile;
  }

  static Profile getProfile(String name) {
    return [SELECT Id FROM Profile WHERE Name = :name];
  }

  static User createTestUser(String name, Profile p) {
    String orgId = UserInfo.getOrganizationId();
    String dateString = String.valueOf(Datetime.now())
      .replace(' ', '')
      .replace(':', '')
      .replace('-', '');
    Integer randomInt = Integer.valueOf(Math.rint(Math.random() * 1000000));
    String uniqueName = orgId + dateString + randomInt;

    return new User(
      LastName = name,
      Username = uniqueName + '@test' + orgId + '.org',
      Email = uniqueName + '@test' + orgId + '.org',
      EmailEncodingKey = 'ISO-8859-1',
      Alias = uniqueName.substring(18, 23),
      TimeZoneSidKey = 'America/Los_Angeles',
      LocaleSidKey = 'en_US',
      LanguageLocaleKey = 'en_US',
      ProfileId = p.Id
    );
  }

  public static void mockApexClasses() {
    Dao_Test.setRecords(
      getClassesQuery(),
      (List<ApexClass>) JSON.deserialize(
        '[ {' +
        '"attributes" : {' +
        '"type" : "ApexClass",' +
        '"url" : "/services/data/v48.0/sobjects/ApexClass/01p1g000002pM1sAAE"' +
        '},' +
        '"NamespacePrefix" : "dcstuff",' +
        '"Name" : "SampleClass",' +
        '"Id" : "01p1g000002pM1sAAE"' +
        '} ]',
        List<ApexClass>.class
      )
    );
  }

  public static void mockNoApexClasses() {
    Dao_Test.setRecords(
      getClassesQuery(),
      (List<ApexClass>) JSON.deserialize('[]', List<ApexClass>.class)
    );
  }

  static String getClassesQuery() {
    String searchTerm = 'amp';
    String newSearchTerm = '%' + searchTerm + '%';

    return 'SELECT NamespacePrefix, Name ' +
      'FROM ApexClass ' +
      'WHERE ' +
      'Name LIKE \'' +
      newSearchTerm +
      '\' ' +
      'AND (NamespacePrefix != \'' +
      Scheduler.NAMESPACE_PREFIX +
      '\' ' +
      'OR (NamespacePrefix = \'' +
      Scheduler.NAMESPACE_PREFIX +
      '\' ' +
      'AND Name != \'' +
      Scheduler.THIS_CLASS +
      '\')) ' +
      'ORDER BY Name';
  }

  public static void assignPermissions(User u) {
    if (u.Id != null) {
      insert new PermissionSetAssignment(
        PermissionSetId = getThePermissionSet().Id,
        AssigneeId = u.Id
      );
    }
  }

  static PermissionSet getThePermissionSet() {
    if (thePermissionSet == null) {
      thePermissionSet = [
        SELECT Id
        FROM PermissionSet
        WHERE
          Name = :Scheduler.PERMISSION_SET
          AND PermissionSet.NamespacePrefix = :Scheduler.NAMESPACE_PREFIX
      ];
    }
    return thePermissionSet;
  }

  public static ScheduloMaticEntry__c getStarterEntry() {
    Datetime start = Datetime.now().addMinutes(5);

    return new ScheduloMaticEntry__c(
      Name = 'blah',
      Class__c = 'hey',
      IsBatchable__c = true,
      Start__c = start,
      DailyStartDateTime__c = start,
      RepeatInterval__c = 0,
      RescheduleInterval__c = 5
    );
  }
}
