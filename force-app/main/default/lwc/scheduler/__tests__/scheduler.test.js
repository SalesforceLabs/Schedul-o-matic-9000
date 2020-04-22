/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createElement } from "lwc";
import Scheduler from "c/Scheduler";
import { getNavigateCalledWith } from "lightning/navigation";
import init from "@salesforce/apex/Scheduler.init";

jest.mock(
  "@salesforce/apex/Scheduler.init",
  () => {
    return {
      default: jest.fn()
    };
  },
  { virtual: true }
);

function setupTest() {
  const element = createElement("c-scheduler", {
    is: Scheduler
  });
  document.body.appendChild(element);

  return element;
}

describe("c-scheduler", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }

    // Prevent data saved on mocks from leaking between tests
    jest.clearAllMocks();
  });

  // Helper function to wait until the microtask queue is empty. This is needed
  // for promise timing when calling imperative Apex.
  function flushPromises() {
    // eslint-disable-next-line no-undef
    return new Promise(resolve => setImmediate(resolve));
  }

  it("should show component with full permissions", async () => {
    init.mockResolvedValue([]);

    const NAV_TYPE = "standard__objectPage";
    const NAV_OBJECT_API_NAME = "dcstuff__SchedulomaticEntry__c";
    const NAV_ACTION_NAME = "list";
    const NAV_FILTER_NAME = "dcstuff__All";

    const element = setupTest();

    let spinner = element.shadowRoot.querySelector("lightning-spinner");
    expect(spinner).not.toBeNull();

    await flushPromises();

    spinner = element.shadowRoot.querySelector("lightning-spinner");
    expect(spinner).toBeNull();

    const noPermiso = element.shadowRoot.querySelector(".noPermiso");
    expect(noPermiso).toBeNull();

    const mainOptions = element.shadowRoot.querySelector("lightning-tabset");
    expect(mainOptions).not.toBeNull();

    const { pageReference } = getNavigateCalledWith();

    expect(pageReference.type).toBe(NAV_TYPE);
    expect(pageReference.attributes.objectApiName).toBe(NAV_OBJECT_API_NAME);
    expect(pageReference.attributes.actionName).toBe(NAV_ACTION_NAME);
    expect(pageReference.state.filterName).toBe(NAV_FILTER_NAME);

    const scheduleButton = element.shadowRoot.querySelector(
      "lightning-button-menu"
    );
    expect(scheduleButton.disabled).toBeTruthy();
  });

  it("should show no permiso error if missing permission set", async () => {
    const noPermisoError = new Error();
    noPermisoError.body = { message: "No permiso!" };
    init.mockImplementation(() => {
      throw noPermisoError;
    });

    const element = setupTest();

    await flushPromises();

    const spinner = element.shadowRoot.querySelector("lightning-spinner");
    expect(spinner).toBeNull();

    const noPermiso = element.shadowRoot.querySelector(".noPermiso");
    expect(noPermiso).not.toBeNull();

    const mainOptions = element.shadowRoot.querySelector("lightning-tabset");
    expect(mainOptions).toBeNull();
  });

  it("should enable submit button upon class selection", async () => {
    init.mockResolvedValue([]);

    const element = setupTest();

    await flushPromises();

    const spinner = element.shadowRoot.querySelector("lightning-spinner");
    expect(spinner).toBeNull();

    const scheduleButton = element.shadowRoot.querySelector(
      "lightning-button-menu"
    );
    expect(scheduleButton.disabled).toBeTruthy();

    const lookup = element.shadowRoot.querySelector("c-class-lookup");
    lookup.dispatchEvent(
      new CustomEvent("optionselected", {
        detail: {
          value: "baddabing",
          batchable: "true",
          schedulable: null
        }
      })
    );

    await flushPromises();
    expect(scheduleButton.disabled).toBeFalsy();
  });
});
