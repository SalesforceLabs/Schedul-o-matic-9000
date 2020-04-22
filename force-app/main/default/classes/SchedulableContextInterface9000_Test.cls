/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
class SchedulableContextInterface9000_Test {
  @IsTest
  static void shouldReturnADummyCronTriggerRecordId() {
    Id expected = CronTrigger.sObjectType.getDescribe()
      .getKeyPrefix()
      .rightPad(15, '0');

    System.assertEquals(
      expected,
      new SchedulableContextInterface9000().getTriggerId()
    );
  }
}
