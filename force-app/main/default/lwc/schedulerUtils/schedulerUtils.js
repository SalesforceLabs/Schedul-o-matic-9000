/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ShowToastEvent } from "lightning/platformShowToastEvent";

const showToast = (caller, title, message, variant, mode) => {
  caller.dispatchEvent(new ShowToastEvent({ title, message, variant, mode }));
};

export { showToast };
