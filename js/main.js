/* eslint-disable */
var totalLength = 640

const memStatus = {
    ALLOCATED: true,
    FREE: false
}

const allMethod = {
    FIRSTFIT : 1,
    BESTFIT : 2
}

function blockSort(a, b){
    return a.start - b.start
}

function freeSortFirstFit(a, b){
    return a.start - b.start
}

function freeSortBestFit(a, b){
    return a.length - b.length
}


class Memory{
    constructor(){
        this.memoryList = []
        this.allocateMethod = allMethod.FIRSTFIT
        var firstFree = new MemoryBlock(totalLength)
        var firstFree2 = new MemoryBlock(totalLength)
        var firstFree3 = new MemoryBlock(totalLength)
        var firstFree4 = new MemoryBlock(totalLength)
        firstFree.start = 1
        firstFree.end = 640
        this.freeList = [firstFree, firstFree2, firstFree3, firstFree4]
    }
    allocate(block){
        if(this.allocateMethod == allMethod.FIRSTFIT){
            this.freeList = this.freeList.sort(freeSortFirstFit)
            if(this.freeList.length > 0){
                for(var index in this.freeList){
                    var nowFree = this.freeList[index]
                    if(nowFree.length >= block.length){
                        block.start = nowFree.start
                        block.end = block.start + block.length - 1
                        block.used = memStatus.ALLOCATED
                        this.memoryList.push(block)
                        this.memoryList = this.memoryList.sort(blockSort)
                        nowFree.start = block.end + 1
                        nowFree.length = nowFree.end - nowFree.start + 1
                        if(nowFree.length == 0){
                            this.freeList.splice(index, 1)
                        }
                        this.freeList = this.freeList.sort(freeSortFirstFit)
                        break
                    }
                }
                if(block.used == memStatus.FREE){
                    return false
                }
                else{
                    return true
                }
            }
            else{
                return false
            }
        }
        else{
            if(this.freeList.length > 0){
                this.freeList = this.freeList.sort(freeSortBestFit)
                for(var index in this.freeList){
                    var nowFree = this.freeList[index]
                    if(nowFree.length >= block.length){
                        block.start = nowFree.start
                        block.end = block.start + block.length - 1
                        block.used = memStatus.ALLOCATED
                        this.memoryList.push(block)
                        this.memoryList = this.memoryList.sort(blockSort)
                        nowFree.start = block.end + 1
                        nowFree.length = nowFree.end - nowFree.start + 1
                        if(nowFree.length == 0){
                            this.freeList.splice(index, 1)
                        }
                        this.freeList = this.freeList.sort(freeSortBestFit)
                        break
                    }
                }
                if(block.used == memStatus.FREE){
                    return false
                }
                else{
                    return true
                }
            }
            else{
                return false
            }
        }
    }
    setMethod(methodString){
        if(methodString == "Firstfit"){
            this.allocateMethod = allMethod.FIRSTFIT
        }
        else if(methodString == "Bestfit"){
            this.allocateMethod = allMethod.BESTFIT
        }
    }
    retrieveFree(block){
        //free this block
        block.used = memStatus.FREE
        block.jobID = 0
        this.memoryList.splice(this.memoryList.indexOf(block), 1)
        this.freeList.push(block)
        if(this.allocateMethod == allMethod.FIRSTFIT){
            this.freeList = this.freeList.sort(freeSortFirstFit)
        }
        else{
            this.freeList = this.freeList.sort(freeSortBestFit)
        }
    }
    merge(){
        this.freeList = this.freeList.sort(blockSort)
        if(this.freeList.length > 0){
            for(var index = 0; index < this.freeList.length; index++){
                console.log(index)
                if(index + 1 == this.freeList.length){
                    break
                }
                var now = this.freeList[index]
                var next = this.freeList[index + 1]
                if(next.start - now.end == 1){
                    now.end = next.end
                    now.length = now.end - now.start + 1
                    this.freeList.splice(index + 1, 1)
                    console.log(index + 1, "merged")
                }
            }
        }
        if(this.allocateMethod == allMethod.FIRSTFIT){
            this.freeList = this.freeList.sort(freeSortFirstFit)
        }
        else{
            this.freeList = this.freeList.sort(freeSortBestFit)
        }
    }
}

class MemoryBlock{
    constructor(memoryLength){
        this.length = memoryLength
        this.start = -1
        this.end = -1
        this.used = memStatus.FREE
        this.jobID = 0
    }
}

var colorBox = [];

(function (window) {
    var document = window.document;
    var startBtn = document.getElementById("startBtn");
    var nextBtn = document.getElementById("next");
    var memoryBlockNumber = 4; 
    var instructionNumber = 320; 
    var numberOfInstructionsInEachPage = 10;
    var currentInstructionSpan = document.getElementById("currentInstruction");
    var numberOfMissingPagesSpan = document.getElementById("numberOfMissingPages");
    var pageFaultRateSpan = document.getElementById("pageFaultRate");
    var memory = [];
    var instructions = []; 
    var instruct = -1;
    var insCount = 0; 
    var strategy = 1;
    var missingPage = 0;
    var po = 0;

    function flagInstructionExecuted(ins) {
        if (typeof instructions[ins] === "undefined") 
        {
            instructions[ins] = false;
        };
        return instructions[ins];
    };
    function flagInstructionAvailable(ins) 
    {
        for (var i = 0; i < memory.length; i++) 
        {
            if (Math.floor(ins / numberOfInstructionsInEachPage) === memory[i]) return i+1;
        };
        return false;
    };

    function Pre() {
        memory = new Array(memoryBlockNumber);
        instructions = new Array(instructionNumber);
        insCount = 0;
        missingPage = 0;
        currentInstructionSpan.textContent = -1;
        numberOfMissingPagesSpan.textContent = missingPage;
        pageFaultRateSpan.textContent = missingPage / 320; 
    };
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function FIFO() {
        // 选择指令的策略
        //  0 - 顺序执行
        //  1 - 向后跳转
        // -1 - 向前跳转
        var strategy = 1;
        var po = 0;
        var instruct = -1;
        insCount = 0;
        while(insCount < 320) {
            if (strategy === 0) {
                instruct++;
                if (insCount % 4 === 1) {
                    strategy = -1;
                } 
                else {
                    strategy = 1;
                };
            } 
            else if (strategy === 1) {
                if (instruct + 1 > 319) {
                    strategy = -1;
                    continue;
                };
                instruct = Math.floor(Math.random() * (instructionNumber - (instruct + 1)) + (instruct + 1));
                strategy = 0;
            } 
            else if (strategy === -1) {
                if (instruct - 2 < 0) {
                    strategy = 1;
                    continue;
                };
                instruct = Math.floor(Math.random() * (instruct - 1));
                strategy = 0;
            };
            if (instruct < 0) {
                instruct = -1;
                strategy = 1;
                continue;
            } 
            else if (instruct >= 320) {
                instruct = 321
                strategy = -1;
                continue;
            };

            var flagNotInBlock = 0;
            if (!flagInstructionExecuted(instruct)) {
                currentInstructionSpan.textContent = instruct;
                flagInBlock = flagInstructionAvailable(instruct);
                if (!flagInBlock){
                    missingPage++;
                    numberOfMissingPagesSpan.textContent = missingPage;
                    pageFaultRateSpan.textContent = missingPage / 320;
                    memory[(po++) % 4] = Math.floor(instruct / numberOfInstructionsInEachPage);
                };
                insCount++;
                instructions[instruct] = true;
            };

            var row = document.getElementById("memoryTable").insertRow();
            row.insertCell(0).innerHTML = instruct;
            row.insertCell(1).innerHTML = memory[0];
            row.insertCell(2).innerHTML = memory[1] == undefined ? "Empty" : memory[1];
            row.insertCell(3).innerHTML = memory[2] == undefined ? "Empty" : memory[2];
            row.insertCell(4).innerHTML = memory[3] == undefined ? "Empty" : memory[3];
            if(po % 4 == 0){
                var pageNumber = 4
            }
            else{
                var pageNumber = po % 4
            }

            for(var i = 0; i <= 3; i++){
                var now = memory[i]
                if(now == undefined){
                    window.dynamic.mem.freeList[i].used = memStatus.FREE
                }
                else{
                    window.dynamic.mem.freeList[i].used = memStatus.ALLOCATED
                    window.dynamic.mem.freeList[i].jobID = now
                }
            }
            window.dynamic.removeAll();
            window.dynamic.refreshMem();
            if(flagInBlock == false)row.insertCell(5).innerHTML = "Page Fault，Instruction: " + instruct + " is not in memory，" + "Move Page that contains Instruction: " + instruct + " into memory and replace (or fill in) Memory Block: " + pageNumber;
            else row.insertCell(5).innerHTML = "Instruction: " + instruct + " is already in the Memory Block: " + flagInBlock;
            await sleep(500)
        };
        document.getElementById("startBtn").disabled = false
        document.getElementById("next").disabled = false
    };

    function FIFOOnce() {
        // 选择指令的策略
        //  0 - 顺序执行
        //  1 - 向后跳转
        // -1 - 向前跳转
        if (strategy === 0) {
            instruct++;
            if (insCount % 4 === 1) {
                strategy = -1;
            } 
            else {
                strategy = 1;
            };
        } 
        else if (strategy === 1) {
            if (instruct + 1 > 319) {
                strategy = -1;
            };
            instruct = Math.floor(Math.random() * (instructionNumber - (instruct + 1)) + (instruct + 1));
            strategy = 0;
        } 
        else if (strategy === -1) {
            if (instruct - 2 < 0) {
                strategy = 1;
            };
            instruct = Math.floor(Math.random() * (instruct - 1));
            strategy = 0;
        };
        if (instruct < 0) {
            instruct = -1;
            strategy = 1;
        } 
        else if (instruct >= 320) {
            instruct = 321
            strategy = -1;
        };

        var flagNotInBlock = 0;
        if (!flagInstructionExecuted(instruct)) {
            currentInstructionSpan.textContent = instruct;
            flagInBlock = flagInstructionAvailable(instruct);
            if (!flagInBlock){
                missingPage++;
                numberOfMissingPagesSpan.textContent = missingPage;
                pageFaultRateSpan.textContent = missingPage / 320;
                memory[(po++) % 4] = Math.floor(instruct / numberOfInstructionsInEachPage);
            };
            insCount++;
            instructions[instruct] = true;
        };

        var row = document.getElementById("memoryTable").insertRow();
        row.insertCell(0).innerHTML = instruct;
        row.insertCell(1).innerHTML = memory[0];
        row.insertCell(2).innerHTML = memory[1] == undefined ? "Empty" : memory[1];
        row.insertCell(3).innerHTML = memory[2] == undefined ? "Empty" : memory[2];
        row.insertCell(4).innerHTML = memory[3] == undefined ? "Empty" : memory[3];
        if(po % 4 == 0){
            var pageNumber = 4
        }
        else{
            var pageNumber = po % 4
        }

        for(var i = 0; i <= 3; i++){
            var now = memory[i]
            if(now == undefined){
                window.dynamic.mem.freeList[i].used = memStatus.FREE
            }
            else{
                window.dynamic.mem.freeList[i].used = memStatus.ALLOCATED
                window.dynamic.mem.freeList[i].jobID = now
            }
        }
        window.dynamic.removeAll();
        window.dynamic.refreshMem();
        if(flagInBlock == false)row.insertCell(5).innerHTML = "Page Fault，Instruction: " + instruct + " is not in memory，" + "Move Page that contains Instruction: " + instruct + " into memory and replace (or fill in) Memory Block: " + pageNumber;
        else row.insertCell(5).innerHTML = "Instruction: " + instruct + " is already in the Memory Block: " + flagInBlock;
        document.getElementById("startBtn").disabled = false
        document.getElementById("next").disabled = false
    };

    async function LRU() {
        //  0: 顺序执行 1: 向后跳转 -1: 向前跳转
        var strategy = 1;
        var stack = [0, 1, 2, 3];
        var instruct = -1;
        insCount = 0;
        while(insCount < 320) {
            if (strategy === 0) {
                instruct++;
                if (insCount % 4 === 1) {
                    strategy = -1;
                } 
                else {
                    strategy = 1;
                };
            } 
            else if (strategy === 1) {
                if (instruct + 1 > 319) {
                    strategy = -1;
                    continue;
                };
                instruct = Math.floor(Math.random() * (instructionNumber - (instruct + 1)) + (instruct + 1));
                strategy = 0;
            } 
            else if (strategy === -1) {
                if (instruct - 2 < 0) {
                    strategy = 1;
                    continue;
                };
                instruct = Math.floor(Math.random() * (instruct - 1));
                strategy = 0;
            };
            if (instruct < 0) {
                instruct = -1;
                strategy = 1;
                continue;
            } 
            else if (instruct >= 320) {
                instruct = 321
                strategy = -1;
                continue;
            };
            var flagInBlock = 0;
            if (!flagInstructionExecuted(instruct)) {
                currentInstructionSpan.textContent = instruct;
                flagInBlock = flagInstructionAvailable(instruct);
                if (!flagInBlock) {
                    missingPage++;
                    numberOfMissingPagesSpan.textContent = missingPage;
                    pageFaultRateSpan.textContent = missingPage / 320;
                    memory[stack[0]] = Math.floor(instruct / numberOfInstructionsInEachPage);
                };
                var page = Math.floor(instruct / numberOfInstructionsInEachPage);
                var block = memory.indexOf(page);
                stack.splice(stack.indexOf(block), 1);
                stack.push(block);
                insCount++;
                instructions[instruct] = true;
            };
            var row = document.getElementById("memoryTable").insertRow();
            row.insertCell(0).innerHTML = instruct;
            row.insertCell(1).innerHTML = memory[0];
            row.insertCell(2).innerHTML = memory[1] == undefined ? "Empty" : memory[1];
            row.insertCell(3).innerHTML = memory[2] == undefined ? "Empty" : memory[2];
            row.insertCell(4).innerHTML = memory[3] == undefined ? "Empty" : memory[3];
            for(var i = 0; i <= 3; i++){
                var now = memory[i]
                if(now == undefined){
                    window.dynamic.mem.freeList[i].used = memStatus.FREE
                }
                else{
                    window.dynamic.mem.freeList[i].used = memStatus.ALLOCATED
                    window.dynamic.mem.freeList[i].jobID = now
                }
            }
            window.dynamic.removeAll();
            window.dynamic.refreshMem();
            if(flagInBlock == false)row.insertCell(5).innerHTML = "Page Fault，Instruction: " + instruct + " is not in memory，" + "Move Page that contains Instruction: " + instruct + " into memory and replace (or fill in) Memory Block: " + (stack[0]);
            else row.insertCell(5).innerHTML = "Instruction: " + instruct + " is already in the Memory Block: " + flagInBlock;
            await sleep(500);
        };
        document.getElementById("startBtn").disabled = false
        document.getElementById("next").disabled = false
    };

    var stackOnce = [0, 1, 2, 3];
    function LRUOnce() {
        //  0: 顺序执行 1: 向后跳转 -1: 向前跳转
        if (strategy === 0) {
            instruct++;
            if (insCount % 4 === 1) {
                strategy = -1;
            } 
            else {
                strategy = 1;
            };
        } 
        else if (strategy === 1) {
            if (instruct + 1 > 319) {
                strategy = -1;
            };
            instruct = Math.floor(Math.random() * (instructionNumber - (instruct + 1)) + (instruct + 1));
            strategy = 0;
        } 
        else if (strategy === -1) {
            if (instruct - 2 < 0) {
                strategy = 1;
            };
            instruct = Math.floor(Math.random() * (instruct - 1));
            strategy = 0;
        };
        if (instruct < 0) {
            instruct = -1;
            strategy = 1;
        } 
        else if (instruct >= 320) {
            instruct = 321
            strategy = -1;
        };
        var flagInBlock = 0;
        if (!flagInstructionExecuted(instruct)) {
            currentInstructionSpan.textContent = instruct;
            flagInBlock = flagInstructionAvailable(instruct);
            if (!flagInBlock) {
                missingPage++;
                numberOfMissingPagesSpan.textContent = missingPage;
                pageFaultRateSpan.textContent = missingPage / 320;
                memory[stackOnce[0]] = Math.floor(instruct / numberOfInstructionsInEachPage);
            };
            var page = Math.floor(instruct / numberOfInstructionsInEachPage);
            var block = memory.indexOf(page);
            stackOnce.splice(stackOnce.indexOf(block), 1);
            stackOnce.push(block);
            insCount++;
            instructions[instruct] = true;
        };
        var row = document.getElementById("memoryTable").insertRow();
        row.insertCell(0).innerHTML = instruct;
        row.insertCell(1).innerHTML = memory[0];
        row.insertCell(2).innerHTML = memory[1] == undefined ? "Empty" : memory[1];
        row.insertCell(3).innerHTML = memory[2] == undefined ? "Empty" : memory[2];
        row.insertCell(4).innerHTML = memory[3] == undefined ? "Empty" : memory[3];
        for(var i = 0; i <= 3; i++){
            var now = memory[i]
            if(now == undefined){
                window.dynamic.mem.freeList[i].used = memStatus.FREE
            }
            else{
                window.dynamic.mem.freeList[i].used = memStatus.ALLOCATED
                window.dynamic.mem.freeList[i].jobID = now
            }
        }
        window.dynamic.removeAll();
        window.dynamic.refreshMem();
        if(flagInBlock == false)row.insertCell(5).innerHTML = "Page Fault，Instruction: " + instruct + " is not in memory，" + "Move Page that contains Instruction: " + instruct + " into memory and replace (or fill in) Memory Block: " + (stackOnce[0]);
        else row.insertCell(5).innerHTML = "Instruction: " + instruct + " is already in the Memory Block: " + flagInBlock;
        document.getElementById("startBtn").disabled = false
        document.getElementById("next").disabled = false
    };

    function chooseAlgrithm() {
        var ratio = document.querySelector("input:checked");
        if (ratio.value === "FIFO") {
            FIFO();
        } 
        else if(ratio.value === "LRU") {
            LRU();
        } 
    };

    function chooseAlgrithmOnce() {
        var ratio = document.querySelector("input:checked");
        if (ratio.value === "FIFO") {
            FIFOOnce();
        } 
        else if(ratio.value === "LRU") {
            LRUOnce();
        } 
    };

    async function start() {
        document.getElementById("startBtn").disabled = true
        document.getElementById("next").disabled = true
        await sleep(1000);
        Pre();
        $("#memoryTable  tr:not(:first)").empty("");
        chooseAlgrithm();
    }
    function nextStep() {
        if(insCount == 0){
            Pre()
        }
        chooseAlgrithmOnce();
    }
    startBtn.addEventListener('click', start);
    nextBtn.addEventListener('click', nextStep);
    
})(window)

var Dynamic = function(element){
    this.element = element;
    this.initShuffle();
}

Dynamic.prototype.initShuffle = function(){
    this.shuffle = new Shuffle(
    this.element,{
        itemSelector: '.box',
        speed: 250,
        easing: 'ease',
        sizer: '.my-sizer-element',
    }
    )
}

Dynamic.prototype.removeAll = function(){
    var total = this.shuffle.visibleItems
    if (!total) {
      return
    }
    var indiciesToRemove = []
    for (var i = 0; i < total; i++) {
      indiciesToRemove.push(i);
    }
  
    // Make an array of elements to remove.
    var collection = indiciesToRemove.map(function (index) {
      return this.shuffle.items[index].element;
    }, this);
  
    // Tell shuffle to remove them
    this.shuffle.remove(collection);
  }

Dynamic.prototype.refreshMem = function(){
    var free = this.mem.freeList
    var all = free
    var elements = []
    all.forEach(function(block){
      var element = Dynamic.prototype.generateMemBlock(block)
      this.shuffle.element.appendChild(element)
      elements.push(element)
    }, this)
    this.shuffle.add(elements)
}

Dynamic.prototype.generateMemBlock = function(itemsToCreate){
    var box = document.createElement('div')
    box.className = 'box col-md-12 border border-dark rounded'
    if(itemsToCreate.used == memStatus.FREE){
      box.style.backgroundColor = "rgb(256,256,256)"
      box.innerHTML = "<p>Null " + "</p>"
    }
    else{
      var jobID = itemsToCreate.jobID
      var newColor = "rgb(256,256,256)"
      // console.log(colorBox)
      for(var index in colorBox){
        if(colorBox[index][0] == jobID){
          newColor = colorBox[index][1]
          console.log(newColor)
          break
        }
      }
      box.style.backgroundColor = newColor
      box.innerHTML = "<p>Allocated For Page Number:" + itemsToCreate.jobID + "</p>"
      box.style.color = "white"
    }
    box.style.height = 130 + "px"
    box.style.padding = '1px'
    box.style.fontSize = 'small'
    return box
}

Dynamic.prototype.initMem = function(){
    this.mem = new Memory()
    this.refreshMem()
}
Dynamic.prototype.getRandomColor = function () {
    return '#' + Math.random().toString(16).slice(2, 8);
}

document.addEventListener('DOMContentLoaded', function(){
    window.dynamic = new Dynamic(document.getElementById('my-shuffle'))
    window.dynamic.initMem()
    for(var i = 0; i <= 31; i++){
        var newColor = Dynamic.prototype.getRandomColor()
        colorBox.push([i, newColor])
    }
    console.log("init")
})



