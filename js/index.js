var oWrap = document.querySelector('.wrap');
var aChild = oWrap.children;
var childLen = aChild.length;
var tempArr = [];
var eventTypeMap = {
  isDown: false,
  isMove: false,
  targetEle: null,
  collisionEle: null,
  vDomArr: [],
  startPt: {
    x: 0,
    y: 0,
    top: 0,
    left: 0
  },
  'mousedown': function(e){
    if(e.target.className === 'child'){
      this.isDown = true;
      this.startPt.x = e.clientX;
      this.startPt.y = e.clientY;
      this.startPt.top = e.target.offsetTop;
      this.startPt.left = e.target.offsetLeft;
      this.targetEle = e.target;
      this.targetEle.classList.add('active');
    }
  },
  'mousemove': function(e){
    if (this.isDown) {
      var collisionArr = [];
      var _x = e.clientX - this.startPt.x;
      var _y = e.clientY - this.startPt.y;
      this.targetEle.style.top = this.startPt.top + _y + 'px';
      this.targetEle.style.left = this.startPt.left + _x + 'px';
      // 自定义属性
      this.targetEle.pointer = {
        x: e.clientX - oWrap.offsetLeft,
        y: e.clientY - oWrap.offsetTop
      }
      // 鼠标移动时判断是否发生碰撞
      for (var i = 0; i < childLen; i++){
        aChild[i].classList.remove('collision');
        if (aChild[i]!== this.targetEle){
          if(isCollision(this.targetEle,aChild[i]) && isInvolved(this.targetEle.pointer,aChild[i])){
            collisionArr.push(aChild[i]);
          }
        }
      }
      // 存在发生碰撞元素
      if(collisionArr.length>0){
        this.collisionEle = getShortDistance(this.targetEle,collisionArr);
        this.collisionEle.classList.add('collision');
        if(this.collisionEle && !this.isMove) {
          var targetIdx = this.vDomArr.indexOf(this.targetEle);
          var collisionIdx = this.vDomArr.indexOf(this.collisionEle);
          this.vDomArr.splice(targetIdx,1);
          this.vDomArr.splice(collisionIdx,0,this.targetEle);
          translateTemp(this.vDomArr,this.targetEle);
        }
      }
    }  
  },
  'mouseup': function(e){
    if(!this.isDown){
      return false;
    }
    this.isDown = false;
    if(this.collisionEle && this.targetEle) {
      translateTemp(this.vDomArr,this.null);
      this.collisionEle.classList.remove('collision');
      this.targetEle.classList.remove('active');
      this.targetEle = null;  
      this.collisionEle = null;
    }
  }
}

initPos();
// 事件监听
oWrap.addEventListener('mousedown',drag,false);
document.addEventListener('mousemove',drag,false);
document.addEventListener('mouseup',drag,false)
// 事件分流函数
function drag(e){
  if (eventTypeMap[e.type] && typeof eventTypeMap[e.type] === 'function'){
    eventTypeMap[e.type](e);
  }
}
// 初始化元素位置函数
function initPos(){
  for (var i = 0; i<childLen; i++){
    (function(i){
      tempArr.push([aChild[i].offsetLeft,aChild[i].offsetTop]);
      setTimeout(function(){
        aChild[i].style.position = 'absolute';
        aChild[i].style.left = tempArr[i][0] + 'px';
        aChild[i].style.top = tempArr[i][1] + 'px';
      },0);
    })(i);
  }
  eventTypeMap.vDomArr = getVirtualArr(aChild);
}
// 元素碰撞函数
function isCollision(dragEle, judgeEle){
  var dragEleTop = dragEle.offsetTop;
  var dragEleLeft = dragEle.offsetLeft;
  var dragEleBottom = dragEleTop + dragEle.offsetHeight;
  var dragEleRight = dragEleLeft + dragEle.offsetWidth;
  var judgeEleTop = judgeEle.offsetTop;
  var judgeEleLeft = judgeEle.offsetLeft;
  var judgeEleBottom = judgeEleTop + judgeEle.offsetHeight;
  var judgeEleRight = judgeEleLeft + judgeEle.offsetWidth;
  if (dragEleRight < judgeEleLeft || dragEleBottom < judgeEleTop || dragEleLeft > judgeEleRight || dragEleTop > judgeEleBottom){
    return false;
  } else {
    return true;
  }
}
// 计算距离最近的碰撞元素
function getShortDistance(dragEle, judgeEleArr) {
  var resultArr = [];
  judgeEleArr.forEach(function(item){
    var a = item.offsetLeft - dragEle.offsetLeft;
    var b = item.offsetTop - dragEle.offsetTop;
    var c = Math.sqrt(a*a + b*b);
    resultArr.push({
      element: item,
      distance: c
    });
  });
  return resultArr.reduce(function(acc,curr){
    if(acc.distance > curr.distance){
      acc = curr;
    }
    return acc;
  }).element;
}
// 获取元素在父级元素中的下标
function getElementIdx(node){
  var elements = node.parentNode.children;
  for (var i = 0, len = elements.length; i < len; i++){
    if (elements[i] === node){
      return i;
    }
  }
}
// 获取虚拟元素列表
function getVirtualArr(nodeList){
  var newArr = [];
  for (var i = 0, len = nodeList.length; i < len; i++){
    newArr[i] = nodeList[i];
  }
  return newArr;
}
// 修改实际tempArr
function translateTemp(vDom,target){
  eventTypeMap.isMove = true;
  tempArr.forEach(function(item,idx){
    if (vDom[idx] !== target){
      vDom[idx].style.left = item[0] + 'px';
      vDom[idx].style.top = item[1] + 'px';  
    }
  });
  setTimeout(function(){
    eventTypeMap.isMove = false;
  },500);
}
// 介入检测 鼠标是否在元素范围内
function isInvolved(pointer,collision) {
  /**
   * dom.left < pointer.x && dom.right > pointer.x && dom.top < pointer.y && dom.bottom> pointer.y
   */
  if (pointer.x > collision.offsetLeft && pointer.x < collision.offsetLeft + collision.offsetWidth && pointer.y > collision.offsetTop && pointer.y < collision.offsetTop + collision.offsetHeight){
    return true;
  } else {
    return false;
  }
}