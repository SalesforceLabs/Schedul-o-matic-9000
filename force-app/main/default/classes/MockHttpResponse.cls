/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

@IsTest
public class MockHttpResponse implements HttpCalloutMock {
  static List<Mock> mocks;

  public static MockHttpResponse builder() {
    mocks = new List<Mock>{ new Mock() };
    return new MockHttpResponse();
  }

  public MockHttpResponse next() {
    mocks.add(new Mock());
    return this;
  }

  public MockHttpResponse statusCode(Integer statusCode) {
    getCurrentResponse().setStatusCode(statusCode);
    return this;
  }

  public MockHttpResponse status(String status) {
    getCurrentResponse().setStatus(status);
    return this;
  }

  public MockHttpResponse contentType(String contentType) {
    getCurrentResponse().setHeader('Content-Type', contentType);
    return this;
  }

  public MockHttpResponse body(String body) {
    getCurrentResponse().setBody(body);
    return this;
  }

  public MockHttpResponse body(Map<String, Object> body) {
    getCurrentResponse().setBody(JSON.serialize(body));
    return this;
  }

  public HttpResponse respond(HttpRequest req) {
    return mocks.remove(0).res;
  }

  static HttpResponse getCurrentResponse() {
    return mocks[mocks.size() - 1].res;
  }

  class Mock {
    HttpResponse res;

    Mock() {
      res = new HttpResponse();
      res.setStatusCode(200);
    }
  }
}
