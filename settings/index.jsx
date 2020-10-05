function GuhrliSettings(){
    return (<Section
      title={<Text bold>CGM Settings</Text>}>
      <Select
        label={'Source'}
        selectViewTitle='Source'
        settingsKey='bgSource'
        options={[
          {name:'None'},
          {name:'Nightscout'},
          {name:'Tomato'},
          {name:'xDrip+ (Offline support)'}
        ]}
      />
      <TextInput
        label="Nightscout URL"
        placeholder="https://<your-nightscout-app>.com"
        settingsKey="nightscoutUrl"
        type="string"
      />
    </Section>
    )
}

export default GuhrliSettings
