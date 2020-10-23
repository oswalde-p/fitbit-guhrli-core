function settingsComponent() {
  return (
    <Page>
      <Section
        title={<Text bold>BG Source</Text>}>
        <Select
          label={'Source'}
          selectViewTitle='Source'
          settingsKey='BG_SOURCE'
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
          settingsKey="NIGHTSCOUT_URL"
          type="string"
        />
      </Section>
    </Page>
  )
}

registerSettingsPage(settingsComponent) //eslint-disable-line no-undef
