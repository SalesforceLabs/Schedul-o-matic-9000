/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public class Dao {
  @TestVisible
  static Map<String, List<SObject>> recordsMap = new Map<String, List<SObject>>();

  public List<SObject> getRecords(String query) {
    if (!recordsMap.containsKey(query)) {
      recordsMap.put(query, Database.query(query));
    }
    return recordsMap.get(query);
  }
}
