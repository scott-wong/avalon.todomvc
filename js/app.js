require(['mmRouter'], function() {
    avalon.filters.capitalize = function(a) {
        return a.charAt(0).toUpperCase() + a.slice(1)
    }

    var model = avalon.define({
        $id: 'todo',
        newTodo: '',
        todos: store('avalon.todos') || [],
        addTodo: function(e) {
            e.preventDefault() //阻止页面刷新
            var newTodo = model.newTodo.trim()
            if (!newTodo.length) {
                return
            }
            model.todos.push({
                title: newTodo,
                completed: false
            });
            model.newTodo = '' //清空内容
        },
        editingIndex: NaN,
        editTodo: function($index) {
            model.editingIndex = $index
                //为了用户体验,有时不得不写一些DOM处理
            var el = this.parentNode.parentNode
            setTimeout(function() { //让光标定位于文本之后
                var input = el.querySelector('input.edit')
                input.focus()
                input.value = input.value
            })
        },
        doneEditing: function() { //还原
            model.editingIndex = NaN
            store('avalon.todos', model.todos.$model)
        },
        allChecked: false,
        checkOne: function() { //点击UI列表的checkbox时
            model.$unwatch()
            model.allChecked = model.todos.every(function(val) {
                return val.completed
            })
            model.$watch()
            updateCount()
        },
        state: 'all',
        status: ['all', 'active', 'completed'],
        showTodo: function(completed) {//根据state判断是否显示某条todo
            return model.state == 'all' || (completed && (model.state == 'completed')) || (!completed && (model.state == 'active'))
        },
        remainingCount: 0,
        completedCount: 0,
        removeCompleted: function() {
            model.todos.removeAll(function(el) {
                return el.completed
            })
        }
    })

    model.$watch('allChecked', function(completed) { //点击上方checkbox时
        model.todos.forEach(function(todo) {
            todo.completed = completed
        })
        updateCount()
    })

    model.todos.$watch('length', updateCount)


    function updateCount() {
        model.remainingCount = model.todos.filter(function(el) {
            return el.completed === false
        }).length
        model.completedCount = model.todos.length - model.remainingCount
        store('avalon.todos', model.todos.$model)
    }

    function store(namespace, data) {
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data))
        }
        var store = localStorage.getItem(namespace)
        return (store && JSON.parse(store)) || []
    }

    //路由
    avalon.router.get('/:state', function() {
        model.state = this.params.state || 'all'
    })
    avalon.history.start({
        basepath: ''
    })
    avalon.scan()
})
