"use client"

import React from "react"
import { ChevronLeftIcon, LoaderIcon, PlugZapIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { appSettings } from "@/app/app-settings"
import { decodeDataSourceSettings, encodeDataSourceSettings, getDataSourceInfo, dataSourceIdList } from "@/features/data-sources"
import type { AppNode, DataSourceInfo, DataSourceSettings, PrimitiveSettingsField, SettingsFormData, SettingsValue } from "@/features/types"
import { useComponentOperationsContext } from "@/features/page-builder/component-operations-context"
import { SettingsFieldInput } from "../shared/settings-field-input"

function useDataSourceSettingsEditor({
  component,
}: Readonly<{
  component: AppNode
}>): Readonly<{
  searchDataSourceTerm: string
  filteredDataSources: ReadonlyArray<DataSourceInfo>
  selectedDataSource: DataSourceInfo | undefined
  isConnected: boolean
  formData: SettingsFormData
  settingsFields: ReadonlyArray<PrimitiveSettingsField>
  setSearchDataSourceTerm: React.Dispatch<React.SetStateAction<string>>
  setSelectedDataSource: React.Dispatch<React.SetStateAction<DataSourceInfo | undefined>>
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>
  handleSave: () => void
  handleDiscard: () => void
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
}> {
  const [searchDataSourceTerm, setSearchDataSourceTerm] = React.useState("")
  const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName
  const savedDataSourceSettings = decodeDataSourceSettings(component.attributes[dataSourceFieldName] || "")
  const dataSourceInfo = savedDataSourceSettings.id ? getDataSourceInfo(savedDataSourceSettings.id) : undefined
  const isConnected = !!savedDataSourceSettings.id
  const [selectedDataSource, setSelectedDataSource] = React.useState<DataSourceInfo | undefined>(dataSourceInfo)
  const [formData, setFormData] = React.useState<SettingsFormData>({ ...savedDataSourceSettings.settings })
  const { updateComponent } = useComponentOperationsContext()

  const filteredDataSources = React.useMemo<DataSourceInfo[]>(() => {
    const dataSources = dataSourceIdList
      .map((dataSourceId) => getDataSourceInfo(dataSourceId))
      .filter((dataSource): dataSource is DataSourceInfo => !!dataSource)

    if (!searchDataSourceTerm.trim()) {
      return dataSources
    }

    const search = searchDataSourceTerm.toLowerCase()
    return dataSources.filter(
      (dataSource) =>
        dataSource.label.toLowerCase().includes(search) ||
        dataSource.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchDataSourceTerm])

  const settingsFields = React.useMemo(
    () => selectedDataSource?.settings || [],
    [selectedDataSource?.settings],
  )

  const handleSave = React.useCallback(() => {
    if (!selectedDataSource) {
      return
    }

    const updatedFormData: Record<string, SettingsValue> = {}
    for (const field of selectedDataSource.settings) {
      const value = formData[field.id]

      if (field.type === "textarea") {
        if (Array.isArray(value)) {
          updatedFormData[field.id] = value.length > 0 ? value : field.defaultValue
        } else if (typeof value === "string") {
          updatedFormData[field.id] = value.trim() === "" ? field.defaultValue : [value]
        } else {
          updatedFormData[field.id] = field.defaultValue
        }
        continue
      }

      if (field.type === "multi-select") {
        updatedFormData[field.id] = Array.isArray(value) && value.length > 0 ? value : field.defaultValue
        continue
      }

      if (field.type === "number") {
        updatedFormData[field.id] = typeof value === "string" && value.trim() !== "" ? Number(value) : field.defaultValue
        continue
      }

      if (field.type === "boolean") {
        updatedFormData[field.id] = typeof value === "boolean" ? value : value === "true"
        continue
      }

      updatedFormData[field.id] = typeof value === "string" && value.trim() === "" ? field.defaultValue : value
    }

    const encodedDataSourceSettings = encodeDataSourceSettings({
      id: selectedDataSource.id,
      settings: updatedFormData,
    })

    updateComponent(component.attributes.id, {
      attributes: {
        ...component.attributes,
        [dataSourceFieldName]: encodedDataSourceSettings,
      },
    })
  }, [component.attributes, dataSourceFieldName, formData, selectedDataSource, updateComponent])

  const handleDiscard = React.useCallback(() => {
    setFormData({})
    setSelectedDataSource(undefined)
    updateComponent(component.attributes.id, {
      attributes: {
        ...component.attributes,
        [dataSourceFieldName]: "",
      },
    })
  }, [component.attributes, dataSourceFieldName, updateComponent])

  const handleFieldChange = React.useCallback((fieldId: string, value: SettingsValue) => {
    setFormData((previous) => ({ ...previous, [fieldId]: value }))
  }, [])

  return {
    searchDataSourceTerm,
    filteredDataSources,
    selectedDataSource,
    isConnected,
    formData,
    settingsFields,
    setSearchDataSourceTerm,
    setSelectedDataSource,
    setFormData,
    handleSave,
    handleDiscard,
    handleFieldChange,
  }
}

export function DataSourceListViewTabContent({
  selectedDataSource,
  setSelectedDataSource,
  isConnected,
  filteredDataSources,
  searchDataSourceTerm,
  setSearchDataSourceTerm,
  formData,
  settingsFields,
  handleDiscard,
  handleSave,
  handleFieldChange,
}: Readonly<{
  selectedDataSource: DataSourceInfo | undefined
  setSelectedDataSource: React.Dispatch<React.SetStateAction<DataSourceInfo | undefined>>
  isConnected: boolean
  filteredDataSources: ReadonlyArray<DataSourceInfo>
  searchDataSourceTerm: string
  setSearchDataSourceTerm: React.Dispatch<React.SetStateAction<string>>
  formData: SettingsFormData
  settingsFields: ReadonlyArray<PrimitiveSettingsField>
  handleDiscard: () => void
  handleSave: () => void
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
}>): React.JSX.Element {
  return (
    <>
      {!selectedDataSource && (
        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-clip">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data sources..."
              defaultValue={searchDataSourceTerm}
              onChange={(event) => setSearchDataSourceTerm(event.target.value)}
              className="pl-10 h-8"
            />
          </div>

          {filteredDataSources.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {filteredDataSources.map((dataSource) => (
                <DataSourceSelectorButton
                  key={dataSource.id}
                  icon={dataSource.Icon}
                  label={dataSource.label}
                  onClick={() => setSelectedDataSource(dataSource)}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
          )}
        </div>
      )}

      {selectedDataSource && (
        <DataSourceSettingsView
          selectedDataSource={selectedDataSource}
          setSelectedDataSource={setSelectedDataSource}
          isConnected={isConnected}
          formData={formData}
          settingsFields={settingsFields}
          handleDiscard={handleDiscard}
          handleFieldChange={handleFieldChange}
          handleSave={handleSave}
        />
      )}
    </>
  )
}

function DataSourceSettingsView(props: Readonly<{
  selectedDataSource: DataSourceInfo | undefined
  setSelectedDataSource: React.Dispatch<React.SetStateAction<DataSourceInfo | undefined>>
  isConnected: boolean
  handleSave: () => void
  handleDiscard: () => void
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
  settingsFields: ReadonlyArray<PrimitiveSettingsField>
  formData: SettingsFormData
}>): React.JSX.Element {
  const {
    selectedDataSource,
    setSelectedDataSource,
    isConnected,
    handleSave,
    handleDiscard,
    handleFieldChange,
    settingsFields,
    formData,
  } = props

  if (!selectedDataSource) {
    throw new Error("Could not find data source")
  }

  const [connectionResult, setConnectionResult] = React.useState("")
  const [testingConnection, setTestingConnection] = React.useState(false)

  const testConnection = async (nextFormData: DataSourceSettings) => {
    try {
      setTestingConnection(true)
      const result = await selectedDataSource.tryConnection(nextFormData)
      setConnectionResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setConnectionResult(JSON.stringify(error, null, 2))
    } finally {
      setTestingConnection(false)
    }
  }

  const discardConnection = React.useCallback(() => {
    handleDiscard()
  }, [handleDiscard])

  return (
    <>
      <div className="flex bg-background border-b align-middle">
        <Button
          className="rounded-none bg-accent border-r text-foreground hover:bg-accent cursor-pointer"
          aria-label="Back to data source list"
          disabled={isConnected}
          onClick={() => setSelectedDataSource(undefined)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="pl-4 flex items-center text-muted-foreground text-sm">{selectedDataSource.label} Settings</span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-y-scroll">
        {settingsFields.map((field) => (
          <SettingsFieldInput
            key={field.id}
            field={field}
            value={formData[field.id] ?? field.defaultValue}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        ))}

        <div className="space-y-2">
          <Button className="cursor-pointer w-full" disabled={testingConnection || !selectedDataSource} onClick={() => testConnection(formData)}>
            {testingConnection ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <PlugZapIcon className="h-4 w-4" />}&nbsp;
            {testingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {connectionResult && (
          <div className="space-y-2">
            <Label htmlFor="example-results">Example Results</Label>
            <pre
              id="example-results"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-scroll"
            >
              {connectionResult}
            </pre>
          </div>
        )}
      </div>

      <div className="flex border-t -mx-4">
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12 cursor-pointer"
          disabled={!isConnected || testingConnection}
          onClick={discardConnection}
        >
          Disconnect
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          disabled={testingConnection || !selectedDataSource}
          onClick={handleSave}
        >
          {isConnected ? "Update" : "Connect"}
        </Button>
      </div>
    </>
  )
}

function DataSourceSelectorButton({
  icon,
  label,
  onClick,
}: Readonly<{
  icon: React.ReactNode
  label: string
  onClick: () => void
}>): React.JSX.Element {
  return (
    <Button variant="outline" size="sm" className="flex flex-col items-center h-auto p-2 gap-1 cursor-pointer" onClick={onClick}>
      <div className="p-1 bg-muted rounded-md">{icon}</div>
      <span className="text-xs text-wrap">{label}</span>
    </Button>
  )
}

export { useDataSourceSettingsEditor }
