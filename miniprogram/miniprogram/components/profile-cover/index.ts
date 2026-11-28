Component({
  properties: {
    cover: {type: String, value: 'woodland'},
    avatar: {type: String, value: 'owl'},
    name: String,
    subtitle: String,
    bio: String,
    customImage: String,
    focus: {type:Number,value:25},
    theme: {type:String,value:'forest'},
    tags: {type:Array,value:[]},
    status: String,
    action: {type:String,value:'编辑资料'},
    showCoverButton: {type:Boolean,value:true},
    editable: Boolean
  },
  methods: {
    changeCover() { this.triggerEvent('coverchange'); },
    editProfile() { this.triggerEvent('profileedit'); }
  }
});
