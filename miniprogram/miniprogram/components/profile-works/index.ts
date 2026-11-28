import {hub} from '../../services/community';
Component({
  properties:{items:{type:Array,value:[]},theme:{type:String,value:'forest'},preview:Boolean},
  methods:{open(event:WechatMiniprogram.TouchEvent){
    if (!this.data.preview) hub('record',String(event.currentTarget.dataset.id));
  }}
});
