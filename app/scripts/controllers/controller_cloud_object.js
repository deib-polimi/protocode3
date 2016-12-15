/*
templates/cloud_object.hbs
*/
App.CloudObjectController = Ember.ObjectController.extend(App.Saveable, {

  isCreatingAttribute: false,
  isAttributeValid: true,

  attributeName: 'newAttribute',
  attributeType: 'String',
  attributeObject: '',
  types: ['String','Integer','Float','Double','Boolean','Object','Object list'],

  // checks if the attribute name is valid and doesn't already exist for this cloudObject
  isAttNameValid: function(){

    var self = this;
    var name = this.get('attributeName');
    var cloudObject = this.get('model');

    self.set('isAttributeValid', true);

    this.store.all('objectAttribute').some(
      function(attribute){

        if(attribute.get('name') === name){
          if(attribute.get('cloudObject') === cloudObject){

            self.set('isAttributeValid', false);
            return false;
          }
        }
      }
    );

    if(!this.get('isAttributeValid')){
      return false;

    }else if(name === ''){
      return false;

    }else{
      return true;
    }
  }.property('attributeName'),

  isObjectType: function(){

    var self = this;
    var type = this.get('attributeType');

    if(type === 'Object' || type === 'Object list'){
      return true;
    }else{
      return false;
    }
  }.property('attributeType'),

  actions: {

    deleteObject: function(name){

      var self = this
      var model = this.get('model');
      var name = model.get('name');

      this.store.find('cloudHandler','cH1').then(
        function(cloudHandler){
          self.store.find('cloudObject', name).then(
            function(cloudObject){

              self.store.findAll('objectAttribute', { cloudObject: model}).then(
                function(array){
                  array.forEach(function (data) {
                    Ember.run.once(self, function () {
                      data.deleteRecord();
                      data.save();
                    });
                  });
                }
              );
              cloudObject.deleteRecord();
              cloudHandler.get('cloudObjects').removeObject(cloudObject);
              cloudHandler.save();
              cloudObject.save();

            });
          });

          this.transitionToRoute('cloud_objects');
        },

        setCreatingAttribute: function(value){
          this.set('isCreatingAttribute',value);
          if(value === false){
            this.set('attributeName','newAttribute');
            this.set('attributeType','string');
          }
        },

        createAttribute: function(){

          var self = this;
          var name = this.get('attributeName');
          var type = this.get('attributeType');
          var object = this.get('attributeObject');
          var cloudObject = this.get('model');
          var cloudObjectName = cloudObject.get('name');

          this.store.find('cloudObject', cloudObjectName).then(
            function(cloudObject){
              self.store.createRecord('objectAttribute', {

                name: name,
                type: type,
                object: object,
                cloudObject: cloudObject

              }).save().then(
                function(attribute){

                  cloudObject.get('objectAttributes').addObject(attribute);
                  cloudObject.save();
                  attribute.save();
                });
              });

              this.set('isCreatingAttribute', false);
              this.set('attributeName','newAttribute');
              this.set('attributeType','string');
              this.set('attributeObject','');
            },

            deleteAttribute: function(key){

              var self = this
              var cloudObject = this.get('model');
              var cloudObjectName = cloudObject.get('name');

              this.store.find('cloudObject', cloudObjectName).then(
                function(cloudObject){
                  self.store.find('objectAttribute', key).then(
                    function(objectAttribute){

                      objectAttribute.deleteRecord();
                      cloudObject.get('objectAttributes').removeObject(objectAttribute);
                      cloudObject.save();
                      objectAttribute.save();
                    });
                  });

          }

      }
});