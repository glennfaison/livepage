"use client"

import React from "react"
import { ChevronLeftIcon, LoaderIcon, PlugZapIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { appSettings } from "@/app/app-settings"
import { decodeDataSourceSettings, encodeDataSourceSettings, getDataSourceInfo, dataSourceIdList } from "@/features/data-sources"
import type { DataSourceInfo, DataSourceSettings, SettingsField as DataSourceSettingsField } from "@/features/data-sources/types"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { SettingsFieldInput } from "../shared/settings-field-input"
import type { ComponentSettingsEditorArgs, DataSourceSettingsEditorArgs, DataSourceSettingsEditorState, DataSourceSettingsViewProps } from "../types"

type DataSourceFormData = Record<string, string>

function normalizeDataSourceFields(fields: ReadonlyArray<DataSourceSettingsField>): ReadonlyArray<DataSourceSettingsField> {
  return fields
}

function useDataSourceSettingsEditor({ component }: DataSourceSettingsEditorArgs): DataSourceSettingsEditorState {
  const [searchDataSourceTerm, setSearchDataSourceTerm] = React.useState("")
  const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName
  const savedDataSourceSettings = decodeDataSourceSettings(component.attributes[dataSourceFieldName] || "")
  const dataSourceInfo = savedDataSourceSettings.id ? getDataSourceInfo(savedDataSourceSettings.id) : undefined
  const [selectedDataSource, setSelectedDataSource] = React.useState<DataSourceInfo | undefined>(dataSourceInfo)
  const [formData, setFormData] = React.useState<DataSourceFormData>({ ...savedDataSourceSettings.settings })
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
    () => normalizeDataSourceFields(selectedDataSource?.settings || []),
    [selectedDataSource?.settings],
  )

  const handleSave = React.useCallback(() => {
    if (!selectedDataSource) {
      return
    }

    const updatedFormData: Record<string, string> = { ...formData }
    for (const field of selectedDataSource.settings) {
      if (updatedFormData[field.id]?.trim() === "") {
        updatedFormData[field.id] = field.defaultValue
      }
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

  const handleFieldChange = React.useCallback((fieldId: string, value: string) => {
    setFormData((previous) => ({ ...previous, [fieldId]: value }))
  }, [])

  return {
    searchDataSourceTerm,
    filteredDataSources,
    selectedDataSource,
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

type DataSourceListViewTabContentProps = DataSourceSettingsEditorState

export function DataSourceListViewTabContent({
  selectedDataSource,
  setSelectedDataSource,
  filteredDataSources,
  searchDataSourceTerm,
  setSearchDataSourceTerm,
  formData,
  settingsFields,
  handleDiscard,
  handleSave,
  handleFieldChange,
}: DataSourceSettingsEditorState): React.JSX.Element {
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

function DataSourceSettingsView(props: DataSourceSettingsViewProps): React.JSX.Element {
  const {
    selectedDataSource,
    setSelectedDataSource,
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
            value={formData[field.id] ?? ""}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        ))}

        <div className="space-y-2">
          <Button className="cursor-pointer w-full" disabled={testingConnection} onClick={() => testConnection(formData)}>
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
          onClick={discardConnection}
        >
          Disconnect
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          onClick={handleSave}
        >
          Connect
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
