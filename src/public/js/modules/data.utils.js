(function (exports) {

  exports.default = class {
    static getRandomConnectionId() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const length = 32;
      let result = '';
      for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    }

    static getCookieFromRequest(cookieModule, request, cookieKey) {
      const requestCookie = request?.headers?.cookie;
      if (requestCookie) {
        const cookies = cookieModule.parse(requestCookie);
        if (cookies.hasOwnProperty(cookieKey)) {
          return cookies[cookieKey];
        }
      }
      return undefined;
    }

    static serializeMessage(type, message) {
      const data = {
        type,
        message
      };
      return JSON.stringify(data);
    }

    static deserializeMessage(data) {
      if (typeof data === 'string') {
        const data = JSON.parse(data);
        if (data.hasOwnProperty("type")
          && data.hasOwnProperty("message")) {
          return data;
        }
      }
      return undefined;
    }
  }
})(typeof exports === 'undefined' ? this['DataUtis'] = {} : exports);


