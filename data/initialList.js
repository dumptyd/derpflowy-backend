guid = (function () {
  var self = {};
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
  }
  self.generate = function () {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
      lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
      lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
      lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  };
  return self;
})();

module.exports = [
  {
    id: '0',
    info: "Example todo-list",
    note: "",
    completed: false,
    uuid: guid.generate(),
    children: [
      {
        id: '0-0',
        info: "Now",
        note: "",
        completed: false,
        uuid: guid.generate(),
        children: [
          {
            id: '0-0-0',
            info: "Eat lunch",
            note: "",
            completed: false,
            uuid: guid.generate(),
            children: []
          }
        ]
      },
      {
        id: '0-1',
        info: "Tomorrow",
        note: "",
        completed: false,
        uuid: guid.generate(),
        children: [
          {
            id: '0-1-0',
            info: "Eat lunch again",
            note: "",
            completed: false,
            uuid: guid.generate(),
            children: []
          }
        ]
      }
    ]
  },
  {
    id: '1',
    info: "TODO",
    note: "",
    completed: false,
    uuid: guid.generate(),
    children: [
      {
        id: '1-0',
        info: "Fix shift+tab",
        note: "",
        completed: true,
        uuid: guid.generate(),
        children: []
      },
      {
        id: '1-1',
        info: "Refactor the code.",
        note: "",
        completed: false,
        uuid: guid.generate(),
        children: []
      },
      {
        id: '1-2',
        info: "Add search",
        note: "",
        completed: false,
        uuid: guid.generate(),
        children: []
      },
      {
        id: '1-3',
        info: "Add delete with backspace",
        note: "Totally need this.",
        completed: false,
        uuid: guid.generate(),
        children: []
      },
      {
        id: '1-4',
        info: "Add zooming",
        note: "No idea why anyone would want that.",
        completed: false,
        uuid: guid.generate(),
        children: []
      },
      {
        id: '1-5',
        info: "Drag and drop",
        note: "Too much work.",
        completed: false,
        uuid: guid.generate(),
        children: []
      }
    ]
  }
];