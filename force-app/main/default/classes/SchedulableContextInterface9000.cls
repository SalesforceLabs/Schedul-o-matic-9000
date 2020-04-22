/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public with sharing class SchedulableContextInterface9000 implements SchedulableContext {
  public Id getTriggerId() {
    return CronTrigger.sObjectType.getDescribe()
      .getKeyPrefix()
      .rightPad(15, '0');
  }
}
