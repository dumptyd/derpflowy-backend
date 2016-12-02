var app = angular.module("flowy", []);
app.controller("flowyController", function ($scope, $timeout, $http, $location) {
  $scope.loading = true;
  $scope.saving = false;
  $scope.elements = [];
  
  $scope.getData = function(){
    $http.get(window.location.pathname+'/getData').then(function(response){
      if(response.data.list){
        $scope.elements = response.data.list;
      }
      $scope.loading = false;
    });
  };
  $scope.getData();
  
  var socket = io('/collab');
  var currentId = window.location.pathname.split('/')[2];
  socket.emit('join room', {roomId: currentId});
  socket.on('updated', function(){
    $scope.getData();
  });
  
  
  $scope.updateRemote = function(){
    $scope.saving = true;
    $http.post(window.location.pathname+'/updateData', {list: $scope.elements, roomId: currentId}).then(function(response, status){
      if(response.data.list){
        $scope.elements = response.data.list;
      }
      $scope.loading = false;
      $scope.saving = false;
    });
  }
  
  $scope.guid = (function () {
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
  // $scope.$storage = $localStorage.$default({
  //   elements: $scope.elements
  // });
  $scope.flatid = [];
  $scope.addNode = function (ref, siblingId, currIndex, metadata = false) {
    //console.log('yeah');
    if (siblingId.indexOf('-') < 0) {
      let uuid = $scope.guid.generate();
      let data = {
        id: ref.length.toString(),
        info: '',
        note: '',
        children: [],
        completed: false,
        uuid: uuid
      };
      ref.splice(parseInt(siblingId) + 1, 0, data);
      $scope.changeIds();
      $timeout(function () {
        $('input[data-uuid="' + uuid + '"]').focus();
      });
      $scope.updateRemote();
      return;
    }
    let node = $scope.getNode(ref, siblingId, currIndex);
    //siblingId = node[node.length - 1].id;
    let id = ''; //siblingId.slice(0, siblingId.lastIndexOf('-') + 1) + (parseInt(siblingId.slice(siblingId.lastIndexOf('-') + 1)) + 1).toString();
    let uuid = $scope.guid.generate();
    let data = {
      id: id,
      info: '',
      note: "",
      completed: false,
      children: [],
      uuid: uuid
    };
    //node.push(data);
    let insertAt = parseInt(siblingId.slice(siblingId.lastIndexOf('-') + 1)) + 1;
    node.splice(insertAt, 0, data);
    $scope.changeIds();
    //console.log('input[data-uuid="' + uuid + '"]');
    $timeout(function () {
      $('input[data-uuid="' + uuid + '"]').focus();
    });
    $scope.updateRemote();
  };
  $scope.addChild = function (ref, siblingId, currIndex) {
    let node = $scope.getNode(ref, siblingId, currIndex);
    let pIndex = false;
    let thisId = '';
    //console.log(node);
    node.forEach(function (elem, index) {
      if (elem.id === siblingId) {
        thisId = index;
        if (index - 1 > -1) pIndex = index - 1;
      }
    });
    if (pIndex !== false) {
      //console.log('shit');
      //node[thisId].id = node[pIndex].id + '-' + node[pIndex].children.length;
      //$scope.changeIds(node[thisId].children,node[thisId].id);
      node[pIndex].children.push(node[thisId]);
      let uuid = node[thisId].uuid;
      node.splice(thisId, 1);
      $scope.changeIds();
      $timeout(function () {
        $('input[data-uuid="' + uuid + '"]').focus();
      });
      $scope.updateRemote();
    }
  };
  $scope.addToParent = function (ref, siblingId, currIndex) {
    if (siblingId.indexOf('-') < 0) return;
    let node = $scope.getNode(ref, siblingId.substr(0, siblingId.lastIndexOf('-')), currIndex);
    let thisNode = $scope.getNode(ref, siblingId, currIndex);
    let pIndex = false;
    let thisId = '';
    thisNode.forEach(function (elem, index) {
      if (elem.id === siblingId) {
        thisId = index;
      }
    });
    //console.log(node[thisId]);
    //console.log('par');
    let insertAt = parseInt(siblingId.slice(0, siblingId.indexOf('-')) + 1);
    //console.log('created ' + insertAt + ' from ' + siblingId);
    node.splice(insertAt, 0, thisNode[thisId]);
    //node.push(thisNode[thisId]);
    let uuid = thisNode[thisId].uuid;
    thisNode.splice(thisId, 1);
    $scope.changeIds();
    $timeout(function () {
      $('input[data-uuid="' + uuid + '"]').focus();
    });
    $scope.updateRemote();
  };
  $scope.changeIdsHelper = function (ref, id) {
    ref.forEach(function (elem, index) {
      //console.log('changed ' + elem.id + ' to: ' + (id + '-' + index));
      elem.id = id + '-' + index;
      $scope.flatid.push(elem.id);
      if (elem.children.length) {
        $scope.changeIdsHelper(elem.children, elem.id);
      }
    });
  };
  $scope.changeIds = function () {
    $scope.flatid = [];
    $scope.elements.forEach(function (element, oIndex) {
      //console.log('changed ' + element.id + ' to: ' + oIndex.toString());
      element.id = oIndex.toString();
      $scope.flatid.push(element.id);
      if (element.children.length) {
        $scope.changeIdsHelper(element.children, element.id);
      }
    });
  };
  $scope.getNode = function (ref, siblingId, currIndex) {
    if (siblingId.indexOf('-') < 0) {
      return ref;
    }
    let parentId = siblingId.slice(0, siblingId.lastIndexOf('-'));
    let pointingIndex = parseInt(parentId.split('-')[currIndex]);
    let refToReturn = '';
    if (ref[pointingIndex].id === parentId) {
      //console.log(ref[pointingIndex].children);
      return ref[pointingIndex].children;
    } else {
      currIndex++;
      refToReturn = $scope.getNode(ref[pointingIndex].children, siblingId, currIndex);
    }
    return refToReturn;
  };
  $scope.getNodeParent = function (ref, siblingId, currIndex) {
    if (siblingId.indexOf('-') < 0) {
      let oIndex = '';
      ref.forEach(function (elem, index) {
        if (elem.id == siblingId) {
          oIndex = index;
        }
      });
      return ref[oIndex];
    }
    let parentId = siblingId;
    let pointingIndex = parseInt(parentId.split('-')[currIndex]);
    let refToReturn = '';
    console.log(ref[pointingIndex].id);
    if (ref[pointingIndex].id === parentId) {
      //console.log(ref[pointingIndex].children);
      return ref[pointingIndex];
    } else {
      currIndex++;
      refToReturn = $scope.getNodeParent(ref[pointingIndex].children, siblingId, currIndex);
    }
    return refToReturn;
  };
  $scope.focusNext = function (siblingId) {
    let index = $scope.flatid.indexOf(siblingId);
    if (index < $scope.flatid.length - 1) {
      while (index < $scope.flatid.length - 1) {
        index++;
        if ($('input[data-id="' + $scope.flatid[index] + '"]').is(':visible')) {
          //console.log($('input[data-id="' + $scope.flatid[index] + '"]'));
          $('input[data-id="' + $scope.flatid[index] + '"]').focus();
          break;
        }
      }
    }
  };
  $scope.focusPrev = function (siblingId) {
    let index = $scope.flatid.indexOf(siblingId);
    if (index > 0) {
      while (index > 0) {
        index--;
        if ($('input[data-id="' + $scope.flatid[index] + '"]').is(':visible')) {
          $('input[data-id="' + $scope.flatid[index] + '"]').focus();
          break;
        }
      }
    }
  };
  $scope.whichKey = function (key, siblingId) {
    //console.log(siblingId);
    if (key.which === 13) $scope.addNode($scope.elements, siblingId, 0);
    else if (key.shiftKey && key.which === 9) {
      key.preventDefault();
      $scope.addToParent($scope.elements, siblingId, 0);
    } else if (key.which === 9) {
      $scope.addChild($scope.elements, siblingId, 0); //tab

      key.preventDefault();
    } else if (key.which === 40) $scope.focusNext(siblingId); //down arrow
    else if (key.which === 38) $scope.focusPrev(siblingId); //up arrow
    else return false;
  };
  $scope.markCompleted = function (id) {
    //console.log(id);
    let parent = $scope.getNodeParent($scope.elements, id, 0);
    //console.log(parent);
    parent.completed = !parent.completed;
    //$scope.markCompletedHelper(parent);
    $scope.updateRemote();
  };
  $scope.markCompletedHelper = function (ref) {
    ref.completed = true;
    if (ref.children.length) {
      ref.children.forEach(elem => {
        $scope.markCompletedHelper(elem);
      });
    }
  };
  $scope.duplicate = function (siblingId) {
    let originalObject = $scope.getNodeParent($scope.elements, siblingId, 0);
    let parent = $scope.getNode($scope.elements, siblingId, 0);
    let newObject = JSON.parse(JSON.stringify(originalObject));
    /*console.log(parent);
    if(newObject.id.indexOf('-')<0){
        newObject.id = parent.length.toString();
    }
    else{
        newObject.id = newObject.id.slice(0,newObject.id.lastIndexOf('-'))+'-'+parent.length;
    }*/
    newObject.info += ' (Copy)';
    //$scope.changeIds(newObject.children,newObject.id);
    parent.push(newObject);
    $scope.changeIds();
    //console.log(newObject);
    $scope.updateRemote();
  };
  $scope.deleteNode = function (siblingId) {
    let node = $scope.getNode($scope.elements, siblingId, 0);
    let thisId = '';
    node.forEach(function (elem, index) {
      if (elem.id === siblingId) {
        thisId = index;
      }
    });
    node.splice(thisId, 1);
    $scope.changeIds();
    $scope.updateRemote();
  };
  $scope.addNote = function (siblingId) {
    let node = $scope.getNode($scope.elements, siblingId, 0);
    let thisId = '';
    node.forEach(function (elem, index) {
      if (elem.id === siblingId) {
        thisId = index;
      }
    });
    node[thisId].note = 'Add note';
  };
  $scope.removeNote = function (siblingId) {
    let node = $scope.getNode($scope.elements, siblingId, 0);
    let thisId = '';
    node.forEach(function (elem, index) {
      if (elem.id === siblingId) {
        thisId = index;
      }
    });
    node[thisId].note = '';
    $scope.updateRemote();
  };
  $scope.toggleCollapse = function (e) {
    let text = e.target.innerHTML;
    text = text === '+' ? '&ndash;' : '+';
    e.target.innerHTML = text;
  };
  $scope.addNew = function () {
    if (!$scope.elements.length) {
      let data = {
        id: '0',
        info: '',
        note: '',
        completed: false,
        children: [],
        uuid: $scope.guid.generate()
      };
      $scope.elements.push(data);
      $scope.updateRemote();
    }
  };
  $timeout(function () {
    //DOM has finished rendering
    $scope.changeIds();
  });
});
app.directive('elementDirective', function () {
  return {
    templateUrl: '../../directives/elementDirective.template.html',
    scope: {
      arr: '=',
      whichkey: '=',
      markcompleted: '=',
      duplicate: '=',
      deletenode: '=',
      addnote: '=',
      removenote: '=',
      addtoparent: '=',
      togglecollapse: '=',
      updateremote: '='
    }
  };
});
