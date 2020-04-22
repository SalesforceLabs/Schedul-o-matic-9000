/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public class Dao_Test {
  @IsTest
  static void testGetRecords() {
    List<SObject> records;
    Test.startTest();
    records = new Dao().getRecords('SELECT Name FROM ApexClass');
    Test.stopTest();

    System.assertEquals(
      [SELECT Name FROM ApexClass].size(),
      records.size(),
      'Size should match'
    );
  }

  public static void setRecords(String query, List<SObject> records) {
    Dao.recordsMap.put(query, records);
  }
}
