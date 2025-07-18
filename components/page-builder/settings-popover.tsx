"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataSourceIdList, decodeDataSourceSettings, encodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceId, DataSourceInfo, DataSourceSettings, SettingsField as DataSourceSettingsField } from "@/features/data-sources/types"
import { getComponentInfo } from "@/features/design-components"
import type { ComponentAttributes, ComponentInfo, ComponentTag, DesignComponent, SettingsField } from "@/features/design-components/types"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { cn } from "@/lib/utils"
import { ChevronLeftIcon, LoaderIcon, PlugZapIcon, Search } from "lucide-react"
import React, { useCallback } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"

const DataSourceSelectorButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <Button variant="outline" size="sm" className="flex flex-col items-center h-auto p-2 gap-1 cursor-pointer" onClick={onClick}>
      <div className="p-1 bg-muted rounded-md">{icon}</div>
      <span className="text-xs text-wrap">{label}</span>
    </Button>
  )
}

function useComponentSettingsEditor<Tag extends ComponentTag>({ component, setIsOpen }: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const componentInfo = React.useMemo(() => getComponentInfo(component.tag), [component.tag])
  const settingsFields = React.useMemo(
    () => Object.values(componentInfo.settingsFields).filter((field) => field.id !== "__data_source__"),
    [componentInfo.settingsFields],
  ) as SettingsField<Tag>[]
  const [formData, setFormData] = React.useState<ComponentAttributes<Tag>>({} as ComponentAttributes<Tag>)

  const { updateComponent } = useComponentOperationsContext()

  React.useEffect(() => {
    const initialFormData = {} as ComponentAttributes<Tag>
    for (const key in componentInfo.settingsFields) {
      initialFormData[key] = componentInfo.settingsFields[key].getValue(component) as ComponentAttributes<Tag>[typeof key]
    }
    setFormData(initialFormData)
  }, [componentInfo.settingsFields, component])

  const handleSave = () => {
    for (const key in componentInfo.defaultAttributes) {
      if (formData[key] === "" || String(formData[key]).trim() === "") {
        formData[key] = componentInfo.defaultAttributes[key]
      }
    }
    let update = {} as Partial<DesignComponent<Tag>>
    for (const key in formData) {
      const reference: SettingsField<Tag> = componentInfo.settingsFields[key]
      update = reference.setValue(update, formData[key])
    }
    updateComponent(component.attributes.id, update)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    setFormData({ ...component.attributes })
    setIsOpen(false)
  }

  const handleFieldChange = (fieldId: keyof ComponentAttributes<Tag>, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }


  return {
    componentInfo,
    settingsFields,
    formData,
    setFormData,
    handleDiscard,
    handleFieldChange,
    handleSave
  }
}

function useDataSourceSettingsEditor<Tag extends ComponentTag>({ component }: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [searchDataSourceTerm, setSearchDataSourceTerm] = React.useState("")
  const savedDataSourceSettings = decodeDataSourceSettings(component.attributes.__data_source__ || "")
  const dataSourceInfo = savedDataSourceSettings.id ? getDataSourceInfo(savedDataSourceSettings.id) : undefined
  const [selectedDataSource, setSelectedDataSource] = React.useState<DataSourceInfo<DataSourceId> | undefined>(dataSourceInfo)
  const { updateComponent } = useComponentOperationsContext()

  const filteredDataSources = React.useMemo(() => {
    const dataSources = dataSourceIdList.map((connId) => getDataSourceInfo(connId))
    if (!searchDataSourceTerm.trim()) return dataSources

    const search = searchDataSourceTerm.toLowerCase()
    return dataSources.filter(
      (conn) =>
        conn.label.toLowerCase().includes(search) ||
        conn.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchDataSourceTerm])

  const [formData, setFormData] = React.useState<DataSourceSettings<DataSourceId>>({ ...savedDataSourceSettings.settings })

  const handleSave = () => {
    if (!selectedDataSource) {
      return
    }
    for (const _key in selectedDataSource.defaultSettings) {
      const key = _key as keyof DataSourceSettings<DataSourceId>
      if (
        String(formData[key]).trim() === "" ||
        !formData.hasOwnProperty(key)
      ) {
        formData[key] = selectedDataSource.defaultSettings[key]
      }
    }
    const encodedDataSourceSettings = encodeDataSourceSettings({ id: selectedDataSource.id, settings: formData })
    updateComponent(component.attributes.id, { attributes: { ...component.attributes, __data_source__: encodedDataSourceSettings } })
  }

  const handleDiscard = () => {
    setFormData({} as DataSourceSettings<DataSourceId>)
    setSelectedDataSource(undefined)
    updateComponent(component.attributes.id, { attributes: { ...component.attributes, __data_source__: "" } })
  }

  const handleFieldChange = (fieldId: keyof ComponentAttributes<Tag>, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const settingsFields = React.useMemo<DataSourceSettingsField<DataSourceId>[]>(
    () => Object.values(selectedDataSource?.settingsFields || {}) as DataSourceSettingsField<DataSourceId>[],
    [selectedDataSource?.settingsFields])

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

function SettingsInputField<Tag extends ComponentTag>({ field, formData, handleFieldChange }: {
  field: SettingsField<Tag>;
  formData: ComponentAttributes<Tag>;
  handleFieldChange: (fieldId: keyof ComponentAttributes<Tag>, value: string) => void;
}): React.JSX.Element {
  let CustomInput;

  switch (field.type) {
    case "textarea":
      CustomInput = (
        <textarea
          id={field.id as string}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
            "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          placeholder={field.placeholder}
          value={(formData[field.id] as string) || ""}
          onChange={(e) => handleFieldChange(field.id, e.target.value)} />
      )
      break;
    case "select":
      CustomInput = (
        <Select
          value={formData[field.id] as string}
          onValueChange={(value) => handleFieldChange(field.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      break;
    default:
      CustomInput = (
        <Input
          type={field.type}
          id={field.id as string}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          disabled={field.disabled}
          value={(formData[field.id] as string) || ""}
          onChange={(e) => handleFieldChange(field.id, e.target.value)} />
      )
      break;
  }

  return (
    <div className="space-y-2" key={field.id as string}>
      <Label htmlFor={String(field.id)}>
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {CustomInput}
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
    </div>
  )
}

function ComponentSettingsTabContent<Tag extends ComponentTag>({ settingsFields, formData, handleDiscard, handleFieldChange, handleSave }: {
  componentInfo: ComponentInfo<Tag>;
  settingsFields: SettingsField<Tag>[];
  formData: ComponentAttributes<Tag>;
  setFormData: React.Dispatch<ComponentAttributes<Tag>>;
  handleDiscard: () => void;
  handleFieldChange: (fieldId: keyof ComponentAttributes<Tag>, value: string) => void;
  handleSave: () => void;
}) {
  return (
    <>
      <div className="space-y-4 p-4 overflow-y-scroll flex-1">
        {settingsFields.map((field) => (
          <SettingsInputField key={field.id as string} field={field} formData={formData} handleFieldChange={handleFieldChange} />
        ))}
      </div>

      {/* Footer Buttons for Settings Tab */}
      <div className="flex border-t">
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12 cursor-pointer"
          onClick={handleDiscard}
        >
          Discard
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </>
  )
}

type DataSourceSettingsEditorProps<ConnId extends DataSourceId> = {
  selectedDataSource: DataSourceInfo<ConnId> | undefined
  setSelectedDataSource: React.Dispatch<DataSourceInfo<ConnId> | undefined>
  filteredDataSources: DataSourceInfo<DataSourceId>[]
  searchDataSourceTerm: string
  setSearchDataSourceTerm: React.Dispatch<string>
  settingsFields: DataSourceSettingsField<ConnId>[]
  formData: DataSourceSettings<ConnId>
  handleDiscard: () => void
  handleSave: () => void
  handleFieldChange: (fieldId: keyof DataSourceSettings<ConnId>, value: string) => void
}

function DataSourceListViewTabContent<ConnId extends DataSourceId>({
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
}: DataSourceSettingsEditorProps<ConnId>) {
  return (
    <>
      {!selectedDataSource && <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-clip">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data sources..."
            defaultValue={searchDataSourceTerm}
            onChange={(e) => setSearchDataSourceTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>

        {/* Data Sources Grid */}
        {filteredDataSources.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredDataSources.map((dataSource) => (
              <DataSourceSelectorButton
                key={dataSource.id}
                icon={dataSource.Icon}
                label={dataSource.label}
                onClick={() => setSelectedDataSource(dataSource as DataSourceInfo<ConnId>)}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
        )}
      </div>}

      {selectedDataSource && <DataSourceSettingsView
        selectedDataSource={selectedDataSource}
        setSelectedDataSource={setSelectedDataSource}
        formData={formData}
        settingsFields={settingsFields}
        handleDiscard={handleDiscard}
        handleFieldChange={handleFieldChange}
        handleSave={handleSave}
        filteredDataSources={filteredDataSources}
        searchDataSourceTerm={searchDataSourceTerm}
        setSearchDataSourceTerm={setSearchDataSourceTerm}
      />}
    </>
  )
}

function DataSourceSettingsView<ConnId extends DataSourceId>(props: DataSourceSettingsEditorProps<ConnId>) {
  const { selectedDataSource, setSelectedDataSource, handleSave, handleDiscard, handleFieldChange, settingsFields, formData } = props
  if (!selectedDataSource) {
    throw new Error(`Could not find data source`)
  }
  const [connectionResult, setConnectionResult] = React.useState<string>("")
  const [testingConnection, setTestingConnection] = React.useState(false)

  const testConnection = async (formData: DataSourceSettings<ConnId>) => {
    try {
      setTestingConnection(true)
      const result = await selectedDataSource.tryConnection(formData)
      setConnectionResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setConnectionResult(JSON.stringify(error, null, 2))
    } finally {
      setTestingConnection(false)
    }
  }

  const discardConnection = useCallback(() => {
    handleDiscard()
  }, [handleDiscard])

  return (
    <>
      <div className="flex bg-background border-b align-middle">
        <Button className="rounded-none bg-accent border-r text-foreground hover:bg-accent cursor-pointer"
          onClick={() => setSelectedDataSource(undefined)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="pl-4 flex items-center text-muted-foreground text-sm">{selectedDataSource?.label} Settings</span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col min-h-1 overflow-y-scroll">
        {settingsFields.map((field) => (
          <div className="space-y-2" key={field.id as string}>
            <Label htmlFor={field.id as string}>{field.label}</Label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id as string}
                className={cn(
                  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
                  "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
                placeholder={field.placeholder}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            ) : (
              <Input
                type={field.type}
                id={field.id as string}
                placeholder={field.placeholder}
                value={(formData[field.id] as string) || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="space-y-2">
          <Button className="cursor-pointer w-full"
            disabled={testingConnection}
            onClick={() => testConnection(formData)}
          >
            {testingConnection ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <PlugZapIcon className="h-4 w-4" />} &nbsp;
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {connectionResult && <div className="space-y-2">
          <Label htmlFor="example-results">Example Results</Label>
          <pre
            id="example-results"
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
              "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "overflow-scroll"
            )}
          >
            {connectionResult || ""}
          </pre>
        </div>}
      </div>

      {/* Footer Buttons for Settings Tab */}
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

export interface SettingsPopoverProps<Tag extends ComponentTag> {
  component: DesignComponent<Tag>
  children: React.ReactNode
}

export const SettingsPopover: React.FC<SettingsPopoverProps<ComponentTag>> = <Tag extends ComponentTag>({
  component,
  children,
}: SettingsPopoverProps<Tag>) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const componentSettingsEditor = useComponentSettingsEditor({ component, setIsOpen })
  const dataSourceSettingsEditor = useDataSourceSettingsEditor({ component, setIsOpen })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[550px] max-h-[600px] overflow-clip flex flex-col">
          {/* Header */}
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentSettingsEditor.componentInfo.label}</h2>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="settings" className="w-full flex flex-col flex-1 min-h-1">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent border-b h-auto p-0">
              <TabsTrigger
                data-testid="settings-tab-trigger"
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                data-testid="data-sources-tab-trigger"
                value="data-sources"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Data Sources
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab Content */}
            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent
                {...componentSettingsEditor}
              />
            </TabsContent>

            {/* Data Sources Tab Content */}
            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
